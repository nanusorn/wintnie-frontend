import {useEffect, useState} from "react";
import {useApiContract, useMoralis} from "react-moralis";
import {getFloorBiddingAddress} from "../../../utils/addressHelpers";
import floorBiddingAbi from "../../../config/abi/floorBidding.json";

export const useGetTestOwner = () => {
    const { isAuthenticated, user } = useMoralis();
    const chainId = 97;
    const [currentContract, setCurrentContract] = useState('');
    const [isContractOwner, setIsContractOwner] = useState(false);

    const {
        runContractFunction,
        data,
        error,
        isLoading,
        isFetching,
    } = useApiContract({
        address: getFloorBiddingAddress(chainId),
        functionName: "owner",
        abi: floorBiddingAbi,
        chain: "bsc testnet",
        params: { },
    });

    useEffect(() => {
        if (!isAuthenticated) {
            setCurrentContract("");
            setIsContractOwner(false)
            return null;
        }
        if (!user) {
            setCurrentContract("");
            setIsContractOwner(false);
            return null;
        }
        setCurrentContract(user.get("ethAddress"));
        runContractFunction();
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated && currentContract != "") {
            if (isFetching) {
                if ((data?.toString().toLowerCase() == currentContract.toLowerCase()) &&
                    isAuthenticated) {
                    setIsContractOwner(true);
                } else {
                    setIsContractOwner(false);
                }
            }
        }
    }, [isFetching, data, currentContract])

    return {isContractOwner: isContractOwner && isAuthenticated};
}
