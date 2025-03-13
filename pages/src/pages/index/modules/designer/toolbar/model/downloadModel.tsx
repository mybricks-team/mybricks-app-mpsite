import { globalModal } from "@/components";
import { AppSelector } from "./content/AppSelector";

export const showDownloadConfig = ({onCompile}) => {
  globalModal.show({
    title: "小程序类型选择",
    footer: null,
    width: 500,
    maskClosable: false,
    children: <AppSelector onCompile={onCompile}></AppSelector>,
  });
};