export default {
  title: "生命周期",
  cards: [
    // {
    //   id: "appOnLaunch",
    //   title: "应用启动",
    //   inputs: [
    //     {
    //       id: "params",
    //       title: "请求描述",
    //       schema: {
    //         type: "object",
    //         properties: {
    //           params: {
    //             type: "object",
    //             description: "启动参数",
    //           },
    //         },
    //       },
    //     },
    //   ],
    // },
    {
      id: "pageOnLoad",
      title: "当页面加载时",
      inputs: [
        {
          id: "onLoad",
          title: "页面加载",
          schema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "当前页面 ID",
              },
              path: {
                type: "string",
                description: "当前页面路径",
              },
              query: {
                type: "object",
                description: "当前页面参数",
              },
            },
          },
        },
      ],
      outputs: [
        {
          id: "next",
          title: "继续",
          schema: {
            type: "any",
          },
        },
      ],
    },
  ],
};
