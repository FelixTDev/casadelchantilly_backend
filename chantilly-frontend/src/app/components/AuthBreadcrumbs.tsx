import React from "react";
import { Link } from "react-router";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";

type Crumb = {
  label: string;
  to?: string;
};

export function AuthBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="mb-5">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          {items.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {item.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.to} className="text-gray-600 transition hover:text-[#D32F2F]">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-bold text-gray-600">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator className="text-gray-300" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
