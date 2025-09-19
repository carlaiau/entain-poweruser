"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import EventCard from "../components/event-card";
import { Heading, Subheading } from "@/catalyst/heading";
import { Button } from "@/catalyst/button";
import { SportLeague } from "@/types";

import { Swiper, type SwiperRef, SwiperSlide } from "swiper/react";
import { Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { main } from "motion/react-client";
export default function LeaguesSingleView({
  leagues,
  onlyBasic = false,
}: {
  onlyBasic?: boolean;
  leagues: SportLeague[];
}) {
  const mainSwiperRef = useRef<SwiperRef | null>(null);

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
      <div className="mt-5 flex gap-2 flex-wrap">
        {sortedLeagues.map((league) => {
          const isActive = league.id === activeId;
          return (
            <Button
              key={league.id}
              onClick={() => handleSelect(league.id)}
              color={isActive ? "blue" : "light"}
              aria-pressed={isActive}
            >
              <p className="text-xs">{league.name}</p>
            </Button>
          );
        })}
      </div>

      {activeLeague && (
        <div key={activeLeague.id}>
          <div className="flex items-start justify-between mt-5 ml-2">
            <a href={`#${activeLeague.id}`} aria-current="page">
              <Subheading className="text-lg font-bold">
                {activeLeague.name}
              </Subheading>
            </a>
          </div>
          <div className="flex flex-wrap gap-2 my-4">
            {activeLeague.events.nodes.map((event, idx) => (
              <Button
                key={event.id}
                onClick={() => mainSwiperRef.current?.swiper.slideTo(idx)}
                outline
              >
                <p className="text-xs">{event.name}</p>
              </Button>
            ))}
          </div>

          <Swiper
            ref={mainSwiperRef}
            spaceBetween={10}
            slidesPerView={1}
            modules={[Scrollbar, A11y]}
            scrollbar={{ draggable: true }}
          >
            {activeLeague.events.nodes.map((event) => (
              <SwiperSlide key={event.id}>
                <div className="bg-zinc-100 p-2 rounded pb-4">
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

                  <EventCard
                    id={event.id}
                    key={event.id}
                    onlyBasic={onlyBasic}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
