"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { LucideIcon } from "lucide-react"; 

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface MenuItem {
  label: string;
  onClick?: () => void;
  subItems?: MenuItem[];
  separator?: boolean;
  icon?: LucideIcon; 
  iconColor?: string; 
}

interface DataTableRowActionsProps<TData> {
  row?: Row<TData>;
  menuItems: MenuItem[];
}

export function DataTableRowActions<TData>({
  menuItems,
}: DataTableRowActionsProps<TData>) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {menuItems.map((item, index) =>
            item.subItems ? (
              <DropdownMenuSub key={index}>
                <DropdownMenuSubTrigger>
                  {item.icon && (
                    <item.icon
                      className={`mr-2 h-4 w-4 ${
                        item.iconColor ?? "text-black"
                      }`}
                    />
                  )}
                  {item.label}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {item.subItems.map((subItem, subIndex) => (
                    <DropdownMenuItem key={subIndex} onClick={subItem.onClick}>
                      {subItem.icon && (
                        <subItem.icon
                          className={`mr-2 h-4 w-4 ${
                            subItem.iconColor ?? "text-black"
                          }`}
                        />
                      )}
                      {subItem.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <React.Fragment key={index}>
                {item.separator && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={item.onClick}>
                  {item.icon && (
                    <item.icon
                      className={`mr-2 h-4 w-4 ${
                        item.iconColor ?? "text-black"
                      }`}
                    />
                  )}
                  {item.label}
                </DropdownMenuItem>
              </React.Fragment>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
