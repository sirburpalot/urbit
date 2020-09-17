import React from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import { Center } from "@tlon/indigo-react";

import { Resource } from "~/views/components/Resource";
import { PopoverRoutes } from "~/views/apps/groups/components/PopoverRoutes";
import { Skeleton } from "~/views/components/Skeleton";

import { Resource as IResource, Groups } from "~/types/group-update";
import { Associations } from "~/types/metadata-update";
import { resourceAsPath } from "~/logic/lib/util";
import { AppName } from "~/types/noun";
import { Contacts, Rolodex } from "~/types/contact-update";
import GlobalApi from "~/logic/api/global";
import { StoreState } from "~/logic/store/type";
import { UnjoinedResource } from "./UnjoinedResource";
import { InvitePopover } from "../apps/groups/components/InvitePopover";

type GroupsPaneProps = StoreState & {
  baseUrl: string;
  groupPath: string;
  api: GlobalApi;
};

export function GroupsPane(props: GroupsPaneProps) {
  const { baseUrl, associations, groups, contacts, api, groupPath } = props;
  const relativePath = (path: string) => baseUrl + path;

  const groupContacts = contacts[groupPath];
  const groupAssociation = associations.contacts[groupPath];
  const group = groups[groupPath];
  const location = useLocation();
  const mobileHide = location.pathname === baseUrl;

  return (
    <Switch>
      <Route
        path={[
          relativePath("/resource/:app/:host/:name")
        ]}
        render={(routeProps) => {
          const { app, host, name } = routeProps.match.params as Record<
            string,
            string
          >;
          const resource = `/${host}/${name}`;
          const appName = app as AppName;
          const association = associations[appName][resource];
          const resourceUrl = `${baseUrl}/resource/${app}${resource}`

          if (!association) {
            return null;
          }

          return (
            <Skeleton
              mobileHide
              selected={resource}
              selectedApp={appName}
              selectedGroup={groupPath}
              {...props}
              baseUrl={resourceUrl}
            >
              <Resource
                {...props}
                {...routeProps}
                association={association}
                baseUrl={baseUrl}
              />
              <PopoverRoutes
                contacts={groupContacts}
                association={groupAssociation}
                group={group}
                api={api}
                s3={props.s3}
                {...routeProps}
                baseUrl={resourceUrl}
              />
              <InvitePopover
                api={api}
                association={groupAssociation}
                baseUrl={resourceUrl}
                groups={props.groups}
                contacts={props.contacts}
              />
            </Skeleton>
          );
        }}
      />
      <Route
        path={relativePath("/join/:app/:host/:name")}
        render={(routeProps) => {
          const { app, host, name } = routeProps.match.params;
          const appName = app as AppName;
          const appPath = `/${host}/${name}`;
          const association = associations[appName][appPath];
          return (
            <Skeleton mobileHide selectedGroup={groupPath} {...props} baseUrl={baseUrl}>
              <UnjoinedResource association={association} />
              <PopoverRoutes
                contacts={groupContacts}
                association={groupAssociation}
                group={group}
                api={api}
                {...routeProps}
                baseUrl={baseUrl}
              />
            </Skeleton>
          );
        }}
      />
      <Route
        path={relativePath("")}
        render={(routeProps) => {
          return (
            <Skeleton selectedGroup={groupPath} {...props} baseUrl={baseUrl}>
              <Center display={["none", "auto"]}>
                Open something to get started
              </Center>
              <PopoverRoutes
                contacts={groupContacts}
                association={groupAssociation}
                group={group}
                api={api}
                {...routeProps}
                baseUrl={baseUrl}
              />
            </Skeleton>
          );
        }}
      />
    </Switch>
  );
}