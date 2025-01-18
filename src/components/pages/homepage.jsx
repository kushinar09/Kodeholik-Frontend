import { AppSidebar } from "@/components/common/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { RadialChart } from "../common/radial-chart"

export default function HomePage() {
  const stats = {
    mainLabel: "Solve",
    mainCount: 100,
    mainTotal: 3406,
    mainColor: "rgb(74, 222, 128)", // Main chart color (green)
    sideStats: [
      {
        label: "Easy",
        count: 40,
        total: 846,
        color: "rgb(74, 222, 128)" // green
      },
      {
        label: "Medium",
        count: 40,
        total: 1775,
        color: "rgb(234, 179, 8)" // yellow
      },
      {
        label: "Hard",
        count: 20,
        total: 785,
        color: "rgb(239, 68, 68)" // red
      }
    ]
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem"
        }
      }
    >
      <AppSidebar />
      <SidebarInset className="peer-data-[state=collapsed]:mx-24">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50">
            <RadialChart {...stats} />
            </div>
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
