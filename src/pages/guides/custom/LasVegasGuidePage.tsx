import GuidePageTemplate from "../../../templates/GuidePageTemplate";
import { loadGuide } from "../../../utils/loadGuide";

export default function LasVegasGuidePage() {
  return <GuidePageTemplate guide={loadGuide("us/nevada/las-vegas")} />;
}
