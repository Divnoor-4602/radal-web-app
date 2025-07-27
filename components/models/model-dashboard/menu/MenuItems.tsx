"use client";

import React from "react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import TrainingStatus from "./TrainingStatus";

const MenuItems = () => {
  return (
    <>
      <Menubar className="bg-[#1C1717] border-border-default rounded-lg">
        <MenubarMenu>
          <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg !pl-3">
            Configuration
          </MenubarTrigger>
          <MenubarContent className="bg-bg-100 border-border-default">
            <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717]">
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717]">
              New Window
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717]">
              Share
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717]">
              Print
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg">
            Datasets
          </MenubarTrigger>
          <MenubarContent className="bg-bg-100 border-border-default">
            <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717]">
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-text-primary text-sm hover:bg-bg-400 focus:bg-bg-400 data-[state=open]:bg-bg-400 tracking-tight rounded-lg !pr-4">
            Download
          </MenubarTrigger>
          <MenubarContent className="bg-bg-100 border-border-default">
            <MenubarItem className="hover:bg-[#1C1717] focus:bg-[#1C1717]">
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <TrainingStatus />
    </>
  );
};

export default MenuItems;
