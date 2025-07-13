import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { menuItems, footerMenuItems } from "@/constants";

const ProjectSidebar = () => {
  return (
    <Sidebar className="bg-bg-100 border-r border-[#262626] py-4 min-h-screen px-5">
      <SidebarHeader className="mb-4.5">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="text-text-primary text-2xl font-bold">Radal</p>
        </div>
        {/* divider */}
        <div className="bg-black w-full h-[1px] mt-4.5 custom-divider-drop-shadow" />
      </SidebarHeader>
      <SidebarContent className="mt-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-6">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title + index}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={
                      item.isActive
                        ? " border-black border px-4 py-4.5 data-[active=true]:bg-bg-300 custom-active-menu-drop-shadow custom-active-menu-inner-shadow rounded-xl"
                        : ""
                    }
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <item.icon
                        className={`size-5 ${
                          item.isActive
                            ? "text-text-primary"
                            : "text-text-inactive"
                        }`}
                      />
                      <span
                        className={`text-base font-medium tracking-[-0.04em] ${
                          item.isActive
                            ? "text-text-primary"
                            : "text-text-inactive"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Sidebar footer */}
      <SidebarFooter>
        <SidebarMenu className="flex flex-col gap-4">
          {footerMenuItems.map((item, index) => (
            <SidebarMenuItem key={item.title + index}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className={
                  item.isActive
                    ? " border-black border px-4 py-4.5 data-[active=true]:bg-bg-300 custom-active-menu-drop-shadow custom-active-menu-inner-shadow rounded-xl"
                    : ""
                }
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon
                    className={`size-5 ${
                      item.isActive ? "text-text-primary" : "text-text-inactive"
                    }`}
                  />
                  <span
                    className={`text-base font-medium tracking-[-0.04em] ${
                      item.isActive ? "text-text-primary" : "text-text-inactive"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {/* settings and avatar */}
        <div className="flex gap-3 items-center mt-9">
          <Avatar className="size-10">
            <AvatarImage
              src="https://github.com/shadcn.png"
              className="rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-text-primary text-base font-medium tracking-tight">
              Div
            </p>
            <p className="text-text-inactive text-sm tracking-tight">
              div@gmail.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ProjectSidebar;
