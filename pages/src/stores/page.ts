import { observable } from 'rxui-t';
import { AnyType, DEV_MODE } from '@/types';

/**
 * 小程序页面配置
*/
interface PageInfo {
	/* 基础配置 */
	pagePath: string; //页面路径

	/* navigation 配置 */
	navigationStyle: string;  //导航栏样式：default 默认样式；custom 自定义导航栏，只保留右上角胶囊按钮
	// navigationStyle 为 default 的时候的配置
	navigationBarTitleText: string;

}

interface WxPreview {
	appid: string
}

class Page {
  appConfig: PageInfo | null = null;
  file: AnyType = {};
  fileContent: Record<string, unknown> | null = null;
  fileId: number;
  sdk: AnyType = {};
  versionApi: AnyType = {};

  previewLoading: boolean = false;
  publishLoading: boolean = false;

  wxPreview: WxPreview = {
    appid: "",
  };

  devMode: DEV_MODE = DEV_MODE.upload;

  wxConfig: AnyType = {};

  compileLocalPath = '';

  /** 打开高级模式，一般一些隐藏功能放在这里 */
  constructor() {}

  // 是否有页面权限
  operable: boolean = false;

  // 保存权限控制
  canSave: boolean = false;

  // 页面信息
  pages: Record<string, {
    id: string;
    title: string;
    fileId: number;
    fileContentId: number;
  }> = {};

  // 页面协作信息
  extraFiles: Record<number, null | {
    id,
    name,
    email,
    avatar
  }> = null;

  /** 平台是否更新，没更新的话都走老逻辑 */
  isNew = false;
}

export const pageModel: Page = observable(new Page());
