import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { listCompanyQuestions } from "../../../api/questions";
import { listCompanies } from "../../../api/taxonomy";
import { useAsync } from "../../../lib/useAsync";
import QuestionArchive from "../../../components/questions/QuestionArchive";

export default function CompanyQuestionsPage() {
  const { companyId } = useParams();
  const companies = useAsync(() => listCompanies(), []);
  const company = (companies.data || []).find((item) => String(item.id) === String(companyId));
  const loader = useCallback(() => listCompanyQuestions(companyId), [companyId]);

  return (
    <QuestionArchive
      eyebrow="Company"
      title={company?.name || "Company questions"}
      description="Questions returned for this company."
      loader={loader}
    />
  );
}
