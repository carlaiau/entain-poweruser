"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Divider } from "@/catalyst/divider";
import EventCard from "../components/event-card";
import { Heading, Subheading } from "@/catalyst/heading";
import { Button } from "@/catalyst/button";
import { SportLeague } from "@/types";

export default function LeaguesSingleView({
  leagues,
}: {
  leagues: SportLeague[];
}) {
  // Sort once for stable nav order
  const sortedLeagues = useMemo(
    () => [...leagues].sort((a, b) => a.name.localeCompare(b.name)),
    [leagues]
  );

  // Start with hash (if present) or first league
  const [activeId, setActiveId] = useState<string>(sortedLeagues[0]?.id);

  // If hash is empty or invalid, default to first league
  useEffect(() => {
    if (!activeId || !sortedLeagues.some((l) => l.id === activeId)) {
      if (sortedLeagues[0]?.id) {
        setActiveId(sortedLeagues[0].id);
      }
    }
  }, [activeId, sortedLeagues]);

  const activeLeague = useMemo(
    () => sortedLeagues.find((l) => l.id === activeId),
    [sortedLeagues, activeId]
  );

  const handleSelect = (id: string) => {
    setActiveId(id);
  };

  if (!sortedLeagues.length) {
    return (
      <div className="w-full min-h-screen">
        <p className="p-4 text-sm text-slate-500">No leagues available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="my-5 flex gap-2 flex-wrap">
        {sortedLeagues.map((league) => {
          const isActive = league.id === activeId;
          return (
            <button
              key={league.id}
              onClick={() => handleSelect(league.id)}
              className={
                "no-underline border rounded-lg py-1 px-2 transition " +
                (isActive
                  ? "bg-black text-white border-black"
                  : "bg-white hover:bg-slate-50")
              }
              aria-pressed={isActive}
            >
              {league.name}
            </button>
          );
        })}
      </div>

      {/* Only the active league is rendered */}
      {activeLeague && (
        <div key={activeLeague.id} className="my-12">
          <div className="flex items-start justify-between my-5">
            <a href={`#${activeLeague.id}`} aria-current="page">
              <Heading className="text-lg font-bold">
                {activeLeague.name}
              </Heading>
            </a>
          </div>

          {activeLeague.events.nodes.map((event) => (
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
                    <p className="text-xs">TAB</p>
                  </Button>
                </div>
              </div>

              <EventCard id={event.id} />
            </div>
          ))}
          <Divider />
        </div>
      )}
    </div>
  );
}
