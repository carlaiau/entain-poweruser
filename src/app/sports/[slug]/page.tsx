import _ from "lodash";
import { SportCategoryResponse } from "@/types";
import EventCard from "../../event-card";
import Link from "next/link";
import { Button } from "@/catalyst/button";
import { Heading, Subheading } from "@/catalyst/heading";

type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const convertedSlug = slug.toUpperCase().replace(/-/g, "_");
  const res = await fetch(
    `https://api.tab.co.nz/gql/router?variables=%7B%22category%22%3A%22${convertedSlug}%22%2C%22statuses%22%3A%5B%22OPEN%22%2C%22LIVE%22%5D%2C%22excludeCategoryIds%22%3A%5B%5D%2C%22includeUpcomingEvents%22%3Atrue%2C%22upcomingEventsCount%22%3A18%2C%22upcomingEventsGroupBy%22%3A%22UNSPECIFIED%22%2C%22upcomingEventsStatuses%22%3A%5B%22OPEN%22%5D%2C%22futuresGroupBy%22%3A%22LEAGUE%22%7D&operationName=SportingCategoryScreen&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22412c242ca66db0ef4f7d486cbf1296e309ac85f150abdd3aed53701314a41b61%22%7D%7D`,
    {
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
    }
  );
  const json: SportCategoryResponse = await res.json();

  const events = json.data?.upcomingEvents?.events.nodes ?? [];

  const uniqueCompetitionNames = _.uniq(events.map((e) => e.competition.name));

  return (
    <div className=" w-full min-h-screen ">
      <Button to="/">Back</Button>
      {uniqueCompetitionNames.map((name) => (
        <div key={name} className="mb-12">
          <Heading className="text-lg font-bold my-5">{name}</Heading>
          {events
            .filter((event) => event.competition.name === name)
            .map((event) => (
              <div key={event.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <Subheading className="text-base font-bold">
                    {event.name}
                  </Subheading>
                  <Subheading>
                    {new Date(event.advertisedStart).toLocaleString()}
                  </Subheading>
                </div>
                <EventCard id={event.id} />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
