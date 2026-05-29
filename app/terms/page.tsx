import { InfoPage } from "@/components/info-page"
import { getInfoPageContent } from "@/lib/info-page-content"

export default async function Page() {
  const content = await getInfoPageContent("terms")

  return <InfoPage content={content} />
}
