import { GetDiaryEntry } from "../graphql";
import { useQuery } from "@apollo/client";

export function useTodayData(skip: boolean, today: string) {
    const {
        data: todayData,
        loading: todayLoading,
        refetch: refetchToday,
    } = useQuery(GetDiaryEntry, {
        variables: { dayKey: today },
        fetchPolicy: "cache-and-network",
        skip,
    });

    return { todayData, todayLoading, refetchToday };
}