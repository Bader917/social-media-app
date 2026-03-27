import { Spinner } from "@heroui/react";


export default function HomePageLoading() {
  return (
    <div className="min-h-screen flex items-start justify-center p-5">
      <Spinner variant="spinner" size='lg' color="primary"/>
    </div>
  )
}