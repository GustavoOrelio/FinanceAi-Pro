import { Suspense, use } from "react"
import { StoreContent } from "./components/store-content"

interface StorePageProps {
  params: Promise<{
    storeId: string
  }>
}

export default function StorePage({ params }: StorePageProps) {
  const { storeId } = use(params)

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <StoreContent storeId={storeId} />
    </Suspense>
  )
} 