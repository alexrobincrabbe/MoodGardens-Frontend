import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GardensByMonth } from "../graphql";
import { periodKeyFor } from "../utils";

type useFetchGardensProps = {
    skip: boolean;
    year: number;
    monthIndex: number;
};

export function useFetchGardens({ skip, year, monthIndex }: useFetchGardensProps) {
    const monthKey = useMemo(
        () => periodKeyFor("MONTH", new Date(Date.UTC(year, monthIndex, 1))),
        [year, monthIndex]
    );
    const { data, loading, error } = useQuery(GardensByMonth, {
        variables: { monthKey },
        skip,
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        returnPartialData: false,
        notifyOnNetworkStatusChange: true,
    });

    return { data, loading, error };
}