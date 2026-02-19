import GuidePageTemplate from "../../../templates/GuidePageTemplate";
import { loadGuide } from "../../../utils/loadGuide";

export default function NevadaGuidePage() {
  return <GuidePageTemplate guide={loadGuide("us/nevada/index")} />;
}
