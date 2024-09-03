import {
  MP_BASIC_COM_LIB,
  MySelf_COM_LIB
} from "../constants";
import { compareVersions } from "compare-versions";
const legacyLibs = [MP_BASIC_COM_LIB]

const getLibsFromConfig = (appData: Record<string, any>) => {
  let libs = [];
  if (appData?.defaultComlibs?.length) {
    appData?.defaultComlibs.forEach((lib) => {
      const { namespace, content, version } = lib;
      const legacyLib = legacyLibs.find((lib) => lib.namespace === namespace);
      const { editJs, rtJs, coms } = JSON.parse(content);
      if (legacyLib) {
        libs.push({ id: legacyLib.id, namespace, version, editJs, rtJs, coms });
      } else {
        libs.push({ ...lib, editJs, rtJs, coms });
      }
    });
  } else {
    libs.push(...legacyLibs);
  }
  if (
    !appData.fileContent?.content?.comlibs ||
    appData.fileContent?.content?.comlibs?.some(
      (lib) => typeof lib === "string"
    )
  ) {
    //initial or cdn legacy
    const myselfLib =
      appData.fileContent?.content?.comlibs?.find(
        (lib) => lib.id === "_myself_"
      ) ?? MySelf_COM_LIB;
    libs.unshift(myselfLib);
    return libs;
  } else {
    libs = appData.fileContent?.content?.comlibs.map((lib) => {
      if (lib.id === "_myself_") return lib;
      try {
        const legacyLib = legacyLibs.find(
          ({ namespace }) => lib.namespace === namespace
        );
        if (legacyLib && compareVersions(legacyLib.version, lib.version) >= 0) {
          lib.legacy = true;
        }
      } catch (error) {
        console.error(error);
      }
      return lib;
    });
    return libs;
  }
};

export { getLibsFromConfig };
