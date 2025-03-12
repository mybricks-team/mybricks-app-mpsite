import React from "react";
import Icon from "./icon";
import Theme from "./Theme";

export default function pluginEntry(config) {
  return {
    name: "@mybricks/plugins/theme",
    title: "主题",
    description: "主题",
    data: {},
    contributes: {
      sliderView: {
        tab: {
          title: "主题",
          icon: Icon,
          apiSet: ["project"],
          render(args) {
            return <Theme {...config} />;
          },
        },
      },
    },
  };
}
