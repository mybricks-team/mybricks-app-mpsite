import { HMRouter } from "@hadss/hmrouter"
import MyBricksIndex from "./pages/Index"

@HMRouter({ pageUrl: "url" }) // TODO 路由配置
@ComponentV2
export default struct Component {
  build() {
    MyBricksIndex()
  }
}
