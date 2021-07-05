import { STAKING_ABI } from "@config/abis";
import { DAYS_PER_YEAR, DOLA3CRV, SECONDS_PER_DAY } from "@config/constants";
import { Contract } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { RetryProvider } from "lib/retry-provider";
import "source-map-support";

export const handler = async () => {
  try {
    const provider = new RetryProvider(
      5,
      "https://cloudflare-eth.com/",
      "homestead"
    );
    const contract = new Contract(DOLA3CRV, STAKING_ABI, provider);

    const rewardRate = await contract.rewardRate();
    const totalSupply = await contract.totalSupply();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        rates: {
          [DOLA3CRV]: totalSupply.gt(0)
            ? (parseFloat(
                formatEther(rewardRate.mul(SECONDS_PER_DAY * DAYS_PER_YEAR))
              ) /
                parseFloat(formatUnits(totalSupply))) *
              100
            : 0,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(err),
    };
  }
};
