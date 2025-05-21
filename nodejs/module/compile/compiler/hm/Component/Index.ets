import { HMRouter } from "@hadss/hmrouter"
import MyBricksIndex from "./pages/Index"

@HMRouter({ pageUrl: "url" })
@ComponentV2
export default struct Component {
  build() {
    MyBricksIndex()
  }
}
