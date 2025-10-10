import { SportCategoryResponse } from "@/types";
import { Button } from "@/catalyst/button";
import LeaguesSingleView from "@/components/league";
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
      <LeaguesSingleView leagues={leagues} />
    </div>
  );
}
