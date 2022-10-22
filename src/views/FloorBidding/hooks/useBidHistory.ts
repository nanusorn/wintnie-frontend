import {useState} from "react";
import { useMoralisQuery } from "react-moralis";

export const useBidHistory = () => {
    const [bidHistory, setBidHistory] = useState([]);

    const refreshHistory = () => {
        console.log("Refresh History");
        const { fetch } = useMoralisQuery(
            "FloorBiddingAnnounceBet",
            (query) => query.equalTo(
                "bettor",
                "0x6207be8a813e9ecdff6f388b99a8108edf8b9cee"
            ),
            [],
            { autoFetch: false }
        )
        const basicQuery = async () => {
            const results = await fetch();
            alert("Successfully retrieved " + results.length + " monsters.");
            // Do something with the returned Moralis.Object values
            for (let i = 0; i < results.length; i++) {
                const object = results[i];
                alert(object.id + " - " + object.get("ownerName"));
            }
        };
        basicQuery();
    }

    return {refreshHistory: refreshHistory, bidHistory: bidHistory};
}
