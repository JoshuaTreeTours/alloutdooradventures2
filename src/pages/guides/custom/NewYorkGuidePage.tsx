import GuidePageTemplate from "../../../templates/GuidePageTemplate";
import { loadGuide } from "../../../utils/loadGuide";

export default function NewYorkGuidePage() {
  return <GuidePageTemplate guide={loadGuide("us/new-york/new-york")} />;
}
