import _ from "lodash";
import { SportCategoryResponse } from "@/types";
import EventCard from "../../event-card";
import Link from "next/link";
import { Button } from "@/catalyst/button";
import { Heading, Subheading } from "@/catalyst/heading";
import { format } from "date-fns";
import { Divider } from "@/catalyst/divider";
import { Fragment } from "react";
import { Badge, BadgeButton } from "@/catalyst/badge";
type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const convertedSlug = slug.toUpperCase().replace(/-/g, "_");

  const gqlRequest = {
    variables: {
      category: convertedSlug,
      statuses: ["OPEN", "LIVE"],
      excludeCategoryIds: [],
      includeUpcomingEvents: true,
      includeFutures: false,
      upcomingEventsGroupBy: "LEAGUE",
      upcomingEventsStatuses: ["OPEN"],
    },
    operationName: "SportingCategoryScreen",
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash:
          "412c242ca66db0ef4f7d486cbf1296e309ac85f150abdd3aed53701314a41b61",
      },
    },
  };

  const baseUrl = "https://api.tab.co.nz/gql/router";

  const url =
    baseUrl +
    "?variables=" +
    encodeURIComponent(JSON.stringify(gqlRequest.variables)) +
    "&operationName=" +
    encodeURIComponent(gqlRequest.operationName) +
    "&extensions=" +
    encodeURIComponent(JSON.stringify(gqlRequest.extensions));

  const res = await fetch(url, {
    headers: {
      accept: "application/graphql-response+json, application/json",
      "content-type": "application/json",
      "graphql-client-build": "e7f6319ee7859d7c5328f9cb2fe26a585ad574a9",
      "graphql-client-name": "sportsbook",
      "graphql-client-version": "hotfix/disable-last-5-request-invalid-uuid",
      "sec-ch-ua":
        '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      Referer: "https://www.tab.co.nz/",
    },
    body: null,
    method: "GET",
  });
  const json: SportCategoryResponse = await res.json();

  console.log(json);

  const leagues = json.data?.upcomingEvents?.leagues.nodes ?? [];

  return (
    <div className=" w-full min-h-screen ">
      <Button to="/">Back</Button>
      <div className="my-5 flex gap-2 flex-wrap">
        {leagues
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((league) => (
            <a
              key={league.name}
              href={"#" + league.id}
              className="no-underline border rounded-lg py-1 px-2"
            >
              {league.name}
            </a>
          ))}
      </div>
      {leagues.map((league) => (
        <div key={league.id}>
          <div key={league.name} className="my-12">
            <div className="flex items-start justify-between my-5">
              <a href="#" id={league.id}>
                <Heading className="text-lg font-bold">{league.name}</Heading>
              </a>
              <Subheading>
                Odds updated at {format(new Date(), "HH:mm")}
              </Subheading>
            </div>
            {league.events.nodes.map((event) => {
              return (
                <div key={event.id}>
                  <div key={event.id} className="my-8">
                    <div className="flex items-center justify-between mb-2 mx-0.5">
                      <div className="flex flex-col">
                        <p className="text-base font-bold">{event.name}</p>
                        <p className="text-sm">
                          {format(
                            new Date(event.advertisedStart),
                            "EEE dd MMM HH:mm"
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <Button
                          to={"https://tab.co.nz" + event.url}
                          color="teal"
                          target="_blank"
                        >
                          <p className="text-xs">Go to TAB market</p>
                        </Button>
                      </div>
                    </div>

                    <EventCard id={event.id} />
                  </div>
                </div>
              );
            })}
          </div>
          <Divider />
        </div>
      ))}
    </div>
  );
}
