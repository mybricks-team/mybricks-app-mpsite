import { pageModel } from "./page";
import { userModel } from "./user";
import API from "@mybricks/sdk-for-app/api";
import cloneDeep from "lodash/cloneDeep";
import _flatten from "lodash/flatten";
import { message } from "antd";
import { toJSONFromPageDump } from "../utils/file-parser";
import {
  ToJsonSchema,
  DumpMetaJson,
  DumpProjectJson,
  DumpPageJson,
  DumpChangedPageInfos,
  ToJsonScene,
} from "./../types";
import axios from "axios";
import { transformToJSON } from "@mybricks/render-utils";
import { versionModel } from "./version";
import dayjs from "dayjs";

interface saveFilesResult {
  id: string;
  fileId: number | string;
  fileContentId: number | string;
}

interface ExportProjectInfo {
  project: DumpMetaJson;
  pages: DumpPageJson[];
}

const SDK = {
  saveScenesToMutiFiles: async ({
    updatePages,
    parentId
  }): Promise<{ updatePagesResult: Array<saveFilesResult> }> => {
    return axios
      .post("/paas/api/workspace/saveScenesToMutiFiles", {
        userId: userModel.user?.id,
        updatePages,
        // parentId
      })
      .then(({ data }: any) => {
        if (data?.code === 1) {
          return data.data;
        } else {
          throw new Error("保存失败");
        }
      })
      .catch((e: any) => {
        throw e;
      });
  },
  getFileContents: async ({
    ids,
    parentId,
  }: {
    ids: Array<string | number>;
    parentId: number;
  }): Promise<Array<any>> => {
    return axios
      .get("/paas/api/workspace/getFileContents", {
        params: {
          ids,
          parentId,
        },
      })
      .then(({ data }: any) => {
        if (data?.code === 1) {
          return data.data;
        } else {
          throw new Error("查询失败");
        }
      })
      .catch((e: any) => {
        throw e;
      });
  },
};
interface PageRemoteJson {
  id: string;
  fileId: number | string;
  fileContentId: number | string;
}

interface FileSaveContent {
  dumpJson: {
    meta: DumpMetaJson;
    pages: Array<PageRemoteJson>;
  };
}

class QueryFileContentsPool {
  private cachedResults = {};
  private batchSize: number;

  constructor({ batchSize = 3 } = {}) {
    this.batchSize = batchSize;
  }

  query = async ({ ids }) => {
    let currentIndex = 0;
    const promises = [];
    while (currentIndex < ids.length) {
      const batchIds = ids.slice(currentIndex, currentIndex + this.batchSize);

      const uncachedBatchIds = batchIds.filter((id) => !this.cachedResults[id]);

      if (uncachedBatchIds.length > 0) {
        // 这一批如果有未缓存的
        promises.push(
          SDK.getFileContents({
            ids: uncachedBatchIds,
            parentId: pageModel.fileId,
          }).then((records) => {
            let _records = Array.isArray(records) ? records : [records];
            _records.forEach((record) => {
              let item = {};
              try {
                item = JSON.parse(record?.content)?.dumpJson;
              } catch (error) {
                console.warn(
                  `[${record.id}]page json 解析失败`,
                  // error,
                  record
                );

                // 进一步处理错误，例如记录错误位置
                if (error instanceof SyntaxError) {
                  const positionMatch = error.message.match(/position (\d+)/);
                  if (positionMatch) {
                    const position = parseInt(positionMatch[1], 10);
                    console.warn(`Error at position: ${position}`);
                    // 你可以在这里添加更多逻辑来处理错误，例如：
                    // - 提取错误位置附近的字符串
                    // - 尝试自动修复错误
                    const errorContext = record?.content.slice(
                      Math.max(0, position - 20),
                      position + 20
                    );
                    console.warn(`Error context: ${errorContext}`);
                  }
                }
              }
              this.cachedResults[record.id] = item;
            });

            return batchIds.map((id) => this.cachedResults[id]);
          })
        );
      } else {
        // 这一批如果都是命中缓存的，直接返回
        const cachedBatchResults = batchIds
          .filter((id) => this.cachedResults[id])
          .map((id) => this.cachedResults[id]);
        promises.push(Promise.resolve(cachedBatchResults));
      }
      currentIndex += this.batchSize;
    }
    return _flatten(await Promise.all(promises));
  };
}

const queryFileContentsPools = new QueryFileContentsPool({ batchSize: 5 });

class LoadStatus {
  private status = "idle";

  shouldFetch = () => this.status === "fail" || this.status === "idle";

  isFail = () => this.status === "fail";
  fail = () => {
    this._reject(new Error("获取小程序数据失败，请重试"));
    this.status = "fail";
  };

  isLoading = () => this.status === "loading";
  loading = () => {
    this.status = "loading";
  };

  isSuccess = () => this.status === "success";
  success = () => {
    this._resolve();
    this.status = "success";
  };

  resetPromise = () => {
    this.readyPromise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  };

  constructor() {
    this.resetPromise();
  }
  private _resolve;
  private _reject;
  private readyPromise: Promise<void>;

  ready = async () => {
    return this.readyPromise;
  };
}

const loadLastStatus = new LoadStatus();

class Content {
  metaContent: DumpMetaJson | DumpProjectJson = {
    pageAry: [],
    openedPageAry: [],
    projectContent: {},
  } as DumpMetaJson;

  /** 所有页面文件原始json信息（不论是否隐藏），只会在初始化的时候拉取一遍最新的，用于后面和 changedPagesMap 合并，生成完整的所有页面 */
  originPagesJson: Array<DumpPageJson> = [];

  /** 远程页面文件meta信息，永远保持最新的，比如保存后这个也是最新的fileContentId */
  pagesMeta: Array<PageRemoteJson> = [];

  designerRef: {
    current: {
      dump: (arg: boolean) => { json: DumpMetaJson };
      toJSON: () => ToJsonSchema;
    };
  };

  /** 设计器的操作记录 */
  operationList: {
    current: any[];
  } = {
    current: [],
  };

  /** 编辑记录 */
  editRecord = {
    global: false,
    canvas: new Set(),
    module: new Set(),
  }

  /** 初始化数据，初始化和导入时使用 */
  private initData = ({
    meta,
    pages,
  }: {
    meta: DumpMetaJson;
    pages?: PageRemoteJson[];
  }) => {
    this.metaContent = meta;
    /**
     * 为了避免脏数据，需要在初始化的时候，根据 pageArg 清洗 pages 数据
     */
    let trustPageIds = meta.pageAry.map((page) => page.id);
    this.pagesMeta = (pages ?? [])
      .filter((page) => {
        return trustPageIds.includes(page.id);
      })
      .sort((a, b) => {
        // 按照上一次打开的页面openedPageAry顺序进行排序
        return (
          meta.openedPageAry.findIndex((t) => t.id === a.id) -
          meta.openedPageAry.findIndex((t) => t.id === b.id)
        );
      });

    this.originPagesJson = [];

    this.changedPagesMap = {
      needUpdate: new Map(),
      updated: new Map(),
      deleted: new Map(),
    };
  };

  initFromFileContent = (_fileContent: DumpMetaJson | FileSaveContent) => {
    const fileContent = cloneDeep(_fileContent);

    // 老数据
    if (fileContent?.content?.["xg.desn.stageview"]) {
      this.metaContent = fileContent as DumpMetaJson;
      return;
    }

    // 新数据
    if (fileContent?.dumpJson) {
      const { meta, pages } = (fileContent as FileSaveContent).dumpJson;
      this.initData({ meta, pages });
      return;
    }

    // 空项目，resolve(undefined)会变成空项目
    this.metaContent = undefined;
    return;
  };

  initDesigner = (designerRef) => {
    this.designerRef = designerRef;
  };

  /** 缓冲区，所有页面修改json信息，用于和 originPagesJson 合并，生成完整的所有页面 */
  changedPagesMap: DumpChangedPageInfos = {
    needUpdate: new Map(),
    updated: new Map(),
    deleted: new Map(),
  };
  /**
   * @description 对页面的增删改进行临时存储，保证调用设计器的dump(true)的时候必须调用
   * 因为设计器调用一次之后，下一次再调用updatedPageAry，deletedPageAry 就没了，所以每一次都必须存起来
   */
  private cacheDumpChanges = ({
    updatedPageAry,
    deletedPageAry,
  }: Pick<DumpMetaJson, "updatedPageAry" | "deletedPageAry">) => {
    if (Array.isArray(updatedPageAry) && updatedPageAry.length) {
      updatedPageAry.forEach((_page) => {
        const page = cloneDeep(_page);
        this.changedPagesMap.needUpdate.set(page.id, page);
      });
    }
    if (Array.isArray(deletedPageAry) && deletedPageAry.length > 0) {
      deletedPageAry.forEach((_page) => {
        const page = cloneDeep(_page);
        this.changedPagesMap.deleted.set(page.id, page);
      });
    }
  };
  /** 把 originPagesJson 跟 changedPagesMap 合并，获取最新的页面Json */
  private getMergedPages = () => {
    let pages: Record<string, DumpPageJson> = {};
    this.originPagesJson.forEach((page) => {
      pages[page.id] = page;
    });

    Array.from(this.changedPagesMap.updated.keys()).forEach((id) => {
      pages[id] = this.changedPagesMap.updated.get(id);
    });

    Array.from(this.changedPagesMap.needUpdate.keys()).forEach((id) => {
      pages[id] = this.changedPagesMap.needUpdate.get(id);
    });

    Array.from(this.changedPagesMap.deleted.keys()).forEach((id) => {
      delete pages[id];
    });

    return {
      toJsonPages: Object.values(pages).map((json) => {
        return toJSONFromPageDump(JSON.stringify(json), {
          forMPA: true,
        });
      }),
      dumpJsonPages: Object.values(pages).map((json) => {
        return json;
      }),
    };
  };

  /** 保存到不同文件，主要是更新最新的 fileContentId 到pagesMeta，然后再用于文件的保存 */
  private saveRemotePages = async (pagesMap, type) => {
    // console.log("pagesMap.values() => ", pagesMap.values())
    const pages = (pageModel.isNew && window.__type__ === "mpa" && type !== 'import') ? Array.from(pagesMap.values()).filter(({ id }) => {
      const page = pageModel.pages[id]

      if (!page) {
        // 新建的
        if (pageModel.operable) {
          // 如果有页面级权限
          return true
        }
      } else {
        if (pageModel.extraFiles[page.fileId]?.id === userModel.user?.id) {
          // 有画布权限
          return true
        }
      }

      return false;
    }) : Array.from(pagesMap.values())

    // console.log("pages => ", pages)

    // console.log("pages => ", pages)
    // console.log("pageModel.extraFiles => ", pageModel.extraFiles)

    if (!Array.isArray(pages) || pages.length === 0) {
      return []
    }

    const updatePages = pages.map((dumpJson) => {
      const info = this.pagesMeta.find((t) => t.id === dumpJson.id);
      return {
        id: dumpJson?.id,
        fileId: info?.fileId,
        fileContentId: info?.fileContentId, // 这个已经可以干掉了，平台版本足够大的情况下可以自动升级
        dumpJson,
        extName: "mp-page-json",
        parentId: pageModel.fileId,
      };
    });

    const { updatePagesResult } = await SDK.saveScenesToMutiFiles({
      updatePages,
      parentId: pageModel.operable ? null : pageModel.fileId
    });

    updatePagesResult.forEach((res) => {
      const idx = this.pagesMeta.findIndex((f) => f.id === res.id);
      if (idx === -1) {
        this.pagesMeta.push(res);
      } else {
        this.pagesMeta[idx] = res;
      }

      // 保存成功后needUpdate需要转换成updated
      const updateItem = this.changedPagesMap.needUpdate.get(res.id);
      this.changedPagesMap.needUpdate.delete(updateItem.id);
      this.changedPagesMap.updated.set(updateItem.id, updateItem);
    });

    return updatePagesResult;
  };

  /**
   * @warning 给到设计器的API务必重新克隆一份，设计器会根据引用类型修改json，导致json格式发生改变
   * */
  getMetaContent = async () => {
    return cloneDeep(this.metaContent);
  };

  private opendPagesLoadRef;
  isOpenedPagesContentLoad = () => {
    return this.opendPagesLoadRef;
  };
  preloadOpenedPagesContent = async () => {
    const { openedPageAry = [] } = this.metaContent ?? {};

    if (Array.isArray(openedPageAry) && openedPageAry.length) {
      this.opendPagesLoadRef = queryFileContentsPools.query({
        ids: openedPageAry.map(
          (p) => this.pagesMeta.find((t) => t.id === p.id)?.fileContentId
        ),
      });
    } else {
      this.opendPagesLoadRef = Promise.resolve([]);
    }

    const records = await this.opendPagesLoadRef;

    /** 空闲1.5s后预请求所有页面内容 */
    this.delayCall(() => {
      this.loadLastPagesContentWhenIdle();
    });

    if (this.originPagesJson.length === 0) {
      this.originPagesJson = records;
    }
  };

  //暴露出去的状态标记，只有 loading 和 success 两种状态
  loadLastStatus = "loading";

  private loadLastPagesContentWhenIdle = async () => {
    if (!loadLastStatus.shouldFetch()) {
      return;
    }

    loadLastStatus.loading();

    try {
      if (
        !Array.isArray(this.pagesMeta) ||
        (Array.isArray(this.pagesMeta) && this.pagesMeta.length === 0)
      ) {
        this.originPagesJson = [];
        loadLastStatus.success();
        return Promise.resolve([]);
      }
      const records = await queryFileContentsPools.query({
        ids: this.pagesMeta.map((p) => p.fileContentId),
      });

      this.originPagesJson = records;
      console.log("加载小程序数据成功");
      loadLastStatus.success();
    } catch (error) {
      loadLastStatus.fail();
    }
  };
  loadPagesReady = async () => {
    if (loadLastStatus.isSuccess()) {
      return this.originPagesJson;
    }

    if (loadLastStatus.isFail()) {
      console.warn("数据预加载数据失败，重试中");
      // 只有重试，才需要新的promise
      loadLastStatus.resetPromise();
      await this.loadLastPagesContentWhenIdle();
    }

    // 返回第一次从delayCall调用的时候返回的primise 以及 后面重试从上面的loadLastPagesContentWhenIdle调用产生的promise
    await loadLastStatus.ready();
    return this.originPagesJson;
  };

  private getRemotePageJson = async ({ fileContentId } = {}) => {
    if (!fileContentId) {
      return {};
    }

    const dumpJson = await queryFileContentsPools.query({
      ids: [fileContentId],
    });
    return dumpJson;
  };

  /** 设计器渲染顺序取决于返回顺序，所以这里需要按调用顺序返回 */
  private getRemotePageJsonOneByOne = oneByOne(this.getRemotePageJson);

  /**
   * @warning 给到设计器的API务必重新克隆一份，设计器会根据引用类型修改json，导致json格式发生改变
   * */
  getPageContent = async ({ sceneId }) => {
    // 本地有远程缓存的话使用缓存
    const preloadPage = this.originPagesJson.find((p) => p?.id === sceneId);
    if (preloadPage) {
      return cloneDeep(preloadPage);
    }

    const pagesMeta = this.pagesMeta.find((p) => p.id === sceneId);
    const pageContent = await this.getRemotePageJsonOneByOne(pagesMeta);
    return cloneDeep(pageContent);
  };

  private delayTimer = null;
  private delayCall = (callback, dalay = 800) => {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
    }
    this.delayTimer = setTimeout(() => {
      callback?.();
    }, dalay);
  };

  /** 根据dumpMetaJson来保存到数据库 */
  private saveByDumpMeta = async (
    projectJson: DumpMetaJson,
    ctx,
    extra = {},
    type
  ) => {
    let {
      updatedPageAry,
      deletedPageAry,
      openedPageAry,
      pageAry,
      projectContent,
    } = projectJson;

    if (window.__type__ === "mpa" && type !== 'import') {
      updatedPageAry = updatedPageAry.filter((updatedPage) => {
        const { id, type } = updatedPage;
        if (!type) {
          return this.editRecord.canvas.has(id) || !pageModel.pages[id]
        }
        return true
      })
    }


    // console.log("updatedPageAry => ", updatedPageAry)
    // console.log("this.editRecord => ", this.editRecord)

    // console.log("pageModel.extraFiles => ", pageModel.extraFiles)
    // console.log("projectJson => ", projectJson)

    await this.cacheDumpChanges({ updatedPageAry, deletedPageAry });
    
    // console.log("this.changedPagesMap.needUpdate => ", this.changedPagesMap.needUpdate)

    const updatePagesResult = await this.saveRemotePages(this.changedPagesMap.needUpdate, type);

    // console.log("updatePagesResult => ", updatePagesResult)
    // console.log("pageModel.pages => ", pageModel.pages)

    // 找出新增的画布，写入pages,extraFiles
    if (window.__type__ === "mpa" && type !== 'import') {
      updatePagesResult.forEach((updatePage) => {
        const dumpPage = pageAry.find((page) => page.id === updatePage.id)
        if (dumpPage && !dumpPage.type) {
          // 没有type说明是画布
          if (!pageModel.pages[dumpPage.id]) {
            // 说明是新增的
            pageModel.pages[dumpPage.id] = {
              id: dumpPage.id,
              title: dumpPage.title,
              type: undefined,
              fileId: updatePage.fileId,
              fileContentId: updatePage.fileContentId
            }
            // 新增的默认上锁
            axios
              .post("/paas/api/file/updateFileCooperationUser", {
                userId: userModel.user?.id,
                fileId: pageModel.fileId + updatePage.fileId,
                status: 1,
              })
          }
        }
        if (pageModel.pages[updatePage.id]) {
          pageModel.pages[updatePage.id].fileContentId = updatePage.fileContentId
        }
      })
    }

    // console.log("updatePagesResult => ", updatePagesResult)
    // console.log("projectJson => ", projectJson)
    // console.log("pageModel => ", pageModel)

    let nextPages = this.pagesMeta;

    const operationList = this.operationList.current.reverse()

    // console.log("operationList => ", operationList)

    if ((pageModel.fileContent.dumpJson || !pageModel.isInit) && window.__type__ === "mpa" && type !== 'import') {
      // 非空页面，拉最新的数据做合并
      // 没权限，能保存的一定是非空页面
      if (!pageModel.operable) {

        if (!updatePagesResult.length) {
          const notModuleSaves = [];
          const notCanvasSaves = []
          // 没有任何更新内容
          updatedPageAry.forEach((updatedPage) => {
            if (updatedPage.type === "module") {
              if (this.editRecord.module.has(updatedPage.id)) {
                notModuleSaves.push(updatedPage)
              }
            } else {
              if (this.editRecord.canvas.has(updatedPage.id)) {
                notCanvasSaves.push(updatedPage)
              }
            }
          })

          return {
            notModuleSaves,
            notCanvasSaves
          }
        }

        const fullFile = await API.File.getFullFile({ fileId: pageModel.fileId });

        const nextContent = JSON.parse(fullFile.content);
        const { dumpJson } = nextContent;
        const { pages } = dumpJson;
  
        nextPages = pages;

        const saves = [];
        const notCanvasSaves = [];
        const notModuleSaves = [];
  
        // 更新的
        updatePagesResult.forEach((res) => {
          const idx = pages.findIndex((f) => f.id === res.id);

          const detail = updatedPageAry.find(({id}) => id === res.id)
          if (detail) {
            saves.push(detail)
            const { id, type } = detail;
            if (!type) {
              this.editRecord.canvas.delete(id)
            } else if (type === "module") {
              this.editRecord.module.delete(id)
            }
          }

          // console.log("detail => ", detail)
          // console.log("res => ", res)

          if (idx === -1) {
            nextPages.push(res);
          } else {
            nextPages[idx] = res;
          }
        })

        updatedPageAry.forEach((updatedPage) => {
          if (!updatePagesResult.find((updatePageRes) => updatePageRes.id === updatedPage.id)) {
            if (updatedPage.type === "module") {
              if (this.editRecord.module.has(updatedPage.id)) {
                notModuleSaves.push(updatedPage)
              }
            } else {
              if (this.editRecord.canvas.has(updatedPage.id)) {
                notCanvasSaves.push(updatedPage)
              }
            }
          }
        })

        // 没有权限，又有画布更新，一定有内容
        versionModel.allowCompare = false;

        const operationListStr = JSON.stringify(operationList);


        return ctx.sdk
          .save({
            userId: userModel.user?.id,
            fileId: pageModel.fileId,
            content: JSON.stringify(nextContent),
            operationList: operationListStr,
          })
          .then((res) => {
            pageModel.isInit = false
            this.operationList.current = [];
            versionModel.file.version = res.version
            setTimeout(() => {
              versionModel.allowCompare = true
            }, 6 * 1000)
            return {
              ...res,
              saves,
              notCanvasSaves,
              notModuleSaves
            };
          });
      } else {
        const fullFile = await API.File.getFullFile({ fileId: pageModel.fileId });
        const nextContent = JSON.parse(fullFile.content);
        const { dumpJson } = nextContent;
        const { pages } = dumpJson;
        nextPages = pages

        if (updatePagesResult.length) {
        updatePagesResult.forEach((res) => {
          const idx = pages.findIndex((f) => f.id === res.id);

          if (idx === -1) {
            nextPages.push(res);
          } else {
            nextPages[idx] = res;
          }
        })
        }
      }
    }

    const dumpJson = {
      meta: {
        openedPageAry: fixOpenedPageAry(openedPageAry),
        pageAry,
        projectContent,
      },
      // pages: this.pagesMeta,
      pages: nextPages
    };

    const saves = [];
    const notCanvasSaves = [];
  
    if (window.__type__ === "mpa" && type !== 'import') {
      // 更新的
      updatePagesResult.forEach((res) => {
        const detail = updatedPageAry.find(({id}) => id === res.id)
        if (detail) {
          saves.push(detail)
          const { id, type } = detail;
          if (!type) {
            this.editRecord.canvas.delete(id)
          } else if (type === "module") {
            this.editRecord.module.delete(id)
          }
        }
      })

      updatedPageAry.forEach((updatedPage) => {
        if (!updatePagesResult.find((updatePageRes) => updatePageRes.id === updatedPage.id)) {
          // 结果里找不到dump，有修改但是没保存
          if (this.editRecord.canvas.has(updatedPage.id)) {
            notCanvasSaves.push(updatedPage)
          }
        }
      })
    }

    versionModel.allowCompare = false;

    return ctx.sdk
      .save({
        userId: userModel.user?.id,
        fileId: pageModel.fileId,
        content: JSON.stringify({
          dumpJson,
          appConfig: pageModel.appConfig,
          wxConfig: pageModel.wxConfig,
          debug: pageModel.debug,
          comlibs: ctx.comlibs,
          tabbar: window.__tabbar__.get(),
          entryPagePath: window.__entryPagePath__?.get() || "",
          type: window.__type__,
          ...extra, // 额外的数据，或者强制覆盖上方的数据
        }),
        operationList: JSON.stringify([{
          title: "应用保存",
          detail: "应用保存",
          updateTime: dayjs(),
          saveType: "app"
        }].concat(operationList)),
      })
      .then((res) => {
        pageModel.isInit = false
        if (pageModel.globalOperable) {
          this.editRecord.global = false;
        }
        this.operationList.current = [];
        versionModel.file.version = res.version
        setTimeout(() => {
          versionModel.allowCompare = true
        }, 6 * 1000)
        return {
          ...res,
          saves,
          notCanvasSaves,
          notModuleSaves: []
        };
      });

    // return API.File.save({
    //   userId: userModel.user?.id,
    //   fileId: pageModel.fileId,
    //   content: JSON.stringify({
    //     dumpJson,
    //     appConfig: pageModel.appConfig,
    //     wxConfig: pageModel.wxConfig,
    //     debug: pageModel.debug,
    //     tabbar: window.__tabbar__.get(),
    //     comlibs: ctx.comlibs,
    //   }),
    // });
  };

  /**
   * @description 对页面的增删改进行远程保存
   */
  save = async (ctx) => {
    const { json: desnJson } = this.designerRef.current?.dump?.(true);
    console.warn("save", desnJson);
    return await this.saveByDumpMeta(desnJson, ctx);
  };

  /** 导出API */
  dump = async (): Promise<ExportProjectInfo> => {
    const { json: desnJson } = this.designerRef.current?.dump?.(true);
    const {
      updatedPageAry,
      deletedPageAry,
      openedPageAry,
      pageAry,
      projectContent,
    } = desnJson;
    await this.cacheDumpChanges({ updatedPageAry, deletedPageAry });

    await this.loadPagesReady();

    const { dumpJsonPages } = this.getMergedPages();

    return {
      project: {
        openedPageAry: fixOpenedPageAry(openedPageAry),
        pageAry,
        projectContent,
      },
      pages: dumpJsonPages,
      extra: {
        appConfig: pageModel.appConfig,
        // wxConfig: pageModel.wxConfig,
        // customComlib: pageModel.customComlib,
        // debug: pageModel.debug,
        tabbar: window.__tabbar__.get(),
        comlibs: pageModel.comlibs,
      },
    };
  };

  /** 导入API */
  loadContent = async (importData: ExportProjectInfo, ctx: any) => {
    if (!pageModel.operable) {
      message.info("未上锁，无法导入覆盖")
      return
    }
    const { project, pages, extra } = importData ?? ({} as ExportProjectInfo);

    if (!project || !Array.isArray(project?.pageAry) || !Array.isArray(pages)) {
      throw new Error("导入数据不合法");
    }
    // TODO 等待页面请求完成才能导入
    await this.loadPagesReady();

    // 将导入的页面设置为要更新的页面
    const updatedPageAry = pages;
    // 将原来的页面设置为要删除的页面
    const { dumpJsonPages: deletedPageAry } = this.getMergedPages();

    // 初始化meta数据，防止上个项目的遗留数据污染其它函数
    this.initData({ meta: project });

    console.log("保存到远程", { ...project, updatedPageAry, deletedPageAry });

    // 保存到远程
    await this.saveByDumpMeta(
      { ...project, updatedPageAry, deletedPageAry },
      ctx,
      extra,
      "import"
    );
    message.success("导入成功，3秒后自动刷新");

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  /** 将每个页面的toJson与全局toJson合并还原成之前完整的toJson */
  toJSON = async () => {
    console.log("[toJSON] start");
    const toJson = cloneDeep(this.designerRef.current?.toJSON());

    const { json: desnJson } = this.designerRef.current?.dump?.(true);
    const { updatedPageAry, deletedPageAry } = desnJson;
    await this.cacheDumpChanges({ updatedPageAry, deletedPageAry });

    await this.loadPagesReady();

    const { toJsonPages } = this.getMergedPages();

    if (window.__type__ === "spa") {
      toJson.scenes = toJsonPages;
    } else {
      toJson.scenes = [
        ...toJson.scenes,
        ...toJsonPages
          .filter((item) => {
            return item.type === "module";
          })
          .map((item) => {
            let result = { ...item };
            delete result.slot.layoutTemplate; //迁移过来的模块，不需要layoutTemplate
            return result;
          })
          .map((item) => {
            return transformToJSON(item);
          })
      ];
    }

    // 兼容对话框 type 问题，如果有对话框，就设置为popup
    toJson.scenes = toJson.scenes.map((scene) => {
      let containPopup = scene.deps.some((dep) => {
        return dep.namespace === "mybricks.taro.popup";
      });

      if (containPopup) {
        return {
          ...scene,
          type: "popup",
        };
      } else {
        return {
          ...scene,
        };
      }
    });

    (toJson?.scenes ?? []).forEach((scene) => {
      Object.keys(scene?.coms ?? {}).forEach((comKey) => {
        const com = scene?.coms[comKey];
        // TODO: 新版分页模式的style上， position 变成了factPosition，兼容一下
        if (com?.model?.style?.factPosition) {
          com.model.style.position = com.model.style.factPosition;
        }
      });
    });

    return toJson;
  };
}

export const contentModel: Content = new Content();

/** 让包裹的函数可以按顺序执行 */
function oneByOne(callback) {
  const queue = [];

  const startReturn = async () => {
    while (queue.length) {
      const { promiseFunc, resolve } = queue.shift();
      const res = await promiseFunc;
      resolve(res);
    }
  };

  let timer = null;

  return (...args) =>
    new Promise((resolve) => {
      queue.push({ promiseFunc: callback?.(...args), resolve });
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        startReturn();
      }, 100);
    });
}

/** OpenedPageAry 包含了所有内容信息，实际上保存和导出的时候并不需要保存，里面只保留id信息即可 */
function fixOpenedPageAry(pageAry) {
  if (!Array.isArray(pageAry)) {
    return [];
  }

  return pageAry.map((item) => ({ id: item.id }));
}
