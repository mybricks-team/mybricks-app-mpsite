import React from "react";
import { notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import { pageModel } from "./page";

const tipStyle = { color: "#FA6400" };

class Version {

  /** 版本对比气泡key */
  compareNotificationKey = `compare_version_${new Date().valueOf()}`;

  /** 是否展示对比通知 */
  showCompareNotification = false;

  /** file信息 */
  file: any;

  /** 允许对比 */
  allowCompare = true;

  constructor() {}

  // 对比
  compare(file) {
    // console.log("pageModel.extraFiles => ", pageModel.extraFiles)
    // console.log("currentFile => ", this.file)
    // console.log("newFile => ", file)
    // console.log("compareNotificationKey => ", this.compareNotificationKey)
    // console.log("this.pageModel => ", this.pageModel)

    if (!this.allowCompare) {
      // 当前禁止对比
      return
    }

    // if (this.showCompareNotification) {
    //   return
    // }

    if (file.version !== this.file.version) {
      // 版本号不同，需要弹出提示
      this.file.version = file.version

      if (file.saveType === "app" || !pageModel.isNew || window.__type__ === "spa") {// 新平台会返回saveType app，!isNew代表老平台
        // 应用保存，包含画布保存
        this.showCompareNotification = true;
        notification.open({
          key: this.compareNotificationKey,
          message: '版本更新提示',
          description: (
            <>
              <div>当前最新保存版本号为 <b style={tipStyle}>{file.version}</b></div>
              <div>由 <b style={tipStyle}>{file.updatorName || file.updatorId || file.creatorName || file.creatorId}</b> 保存</div>
              <div>当前保存版本为 <b style={tipStyle}>应用级</b> 保存</div>
              <div>若您有应用级别的修改，请及时刷新，继续保存将 <b style={tipStyle}>覆盖</b></div>
            </>
          ),
          duration: null,
          onClose: () => {
            this.showCompareNotification = false;
          }
        });
      } else {
        // 仅画布保存
        this.showCompareNotification = true;

        let description = "";

        Object.entries(pageModel.pages).forEach(([id, value]) => {
          const extraFile = pageModel.extraFiles[value.fileId] as any;
          if (extraFile?.fileContentId) {
            if (extraFile.fileContentId !== value.fileContentId) {
              console.log("page => ", JSON.parse(JSON.stringify(value)))
              console.log("extraFile => ", JSON.parse(JSON.stringify(extraFile)))
              // 有更新
              description += `${value.title}，`
              value.fileContentId = extraFile.fileContentId // 更新本地信息
            }
          }
        })

        if (!description) {
          // 没有更新
          this.showCompareNotification = false;
          return
        }

        notification.open({
          key: this.compareNotificationKey,
          message: '版本更新提示',
          description: (
            <>
              <div>当前最新保存版本号为 <b style={tipStyle}>{file.version}</b></div>
              <div>由 <b style={tipStyle}>{file.updatorName || file.updatorId || file.creatorName || file.creatorId}</b> 保存</div>
              <div>当前保存版本为 <b style={tipStyle}>画布级</b> 保存</div>
              <div>更新内容：<b style={tipStyle}>{description}</b></div>
            </>
          ),
          duration: null,
          onClose: () => {
            this.showCompareNotification = false;
          }
        });
      }
    }
  }
}

export const versionModel = new Version();

/**
 * 统一展示时间处理
 * @param time 时间
 * @returns    最终展示的时间格式
 */
export function unifiedTime(time) {
	if (isToday(time)) {
		return dayjs(time).format('HH:mm');
	} else if (isThisYear(time)) {
		return dayjs(time).format('M月D日 HH:mm');
	}

	return dayjs(time).format('YYYY年M月D日');
}

/**
 * 判断时间是否今天
 * @param time 时间
 * @returns    是否今天
 */
function isToday(time) {
	const t = dayjs(time).format('YYYY-MM-DD');
	const n = dayjs().format('YYYY-MM-DD');

	return t === n;
}

/**
 * 判断时间是否今年
 * @param time 时间
 * @returns    是否今年
 */
function isThisYear(time) {
	const t = dayjs(time).format('YYYY');
	const n = dayjs().format('YYYY');

	return t === n;
}