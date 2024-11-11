import system from "./system.txt";
import promoteButton from "./taro-docs/promoteButton.md";
import promoteCheckbox from "./taro-docs/promoteCheckbox.md";
import promoteCheckboxGroup from "./taro-docs/promoteCheckboxGroup.md";
import promoteCoverImage from "./taro-docs/promoteCoverImage.md";
import promoteCoverView from "./taro-docs/promoteCoverImage.md";

import promoteView from "./taro-docs/promoteView.md";
import promoteIcon from "./taro-docs/promoteIcon.md";
import promoteProgress from "./taro-docs/promoteProgress.md";

const systemText = system.replace("-- 组件提示词 --", `
    ${promoteButton}\n
    ${promoteCheckbox}\n
    ${promoteCheckboxGroup}\n
    ${promoteCoverImage}\n
    ${promoteCoverView}\n
    ${promoteView}\n
    ${promoteIcon}\n
    ${promoteProgress}
    `)

export default systemText