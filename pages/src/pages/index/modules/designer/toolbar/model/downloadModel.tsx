import { globalModal } from "@/components";
import { AppSelector } from "./content/AppSelector";
import { HarmonyProductSelector } from "./content/HarmonyProductSelector"

export const showDownloadConfig = ({onCompile}) => {
  globalModal.show({
    title: "小程序类型选择",
    footer: null,
    width: 500,
    maskClosable: false,
    children: <AppSelector onCompile={onCompile}></AppSelector>,
  });
};

export const showHarmonyDownloadConfig = ({ onCompile }) => {
  globalModal.show({
    title: "产物类型选择",
    footer: null,
    width: 500,
    maskClosable: false,
    children: <HarmonyProductSelector onCompile={onCompile}></HarmonyProductSelector>,
  });
}