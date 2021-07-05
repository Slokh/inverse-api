import { HARVESTER_ABI, VAULT_ABI } from "@config/abis";
import {
  DAYS_PER_YEAR,
  HARVESTER,
  SECONDS_PER_DAY,
  VAULT_TOKENS,
} from "@config/constants";
import { BigNumber, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { RetryProvider } from "lib/retry-provider";
import "source-map-support";

export const handler = async () => {
  try {
    const provider = new RetryProvider(
      5,
      "https://cloudflare-eth.com/",
      "homestead"
    );
    const harvester = new Contract(HARVESTER, HARVESTER_ABI, provider);

    const rates = await Promise.all(
      VAULT_TOKENS.map((address: string) => harvester.ratePerToken(address))
    );

    const lastDistribution = await new Contract(
      VAULT_TOKENS[0],
      VAULT_ABI,
      provider
    ).lastDistribution();

    return {
      lastDistribution: lastDistribution.toNumber(),
      rates: rates.reduce((res, rate, i) => {
        res[VAULT_TOKENS[i]] =
          parseFloat(
            formatUnits(
              rate.mul(DAYS_PER_YEAR * SECONDS_PER_DAY),
              BigNumber.from(36).sub(i === 0 ? 6 : 18)
            )
          ) * 100;
        return res;
      }, {}),
    };
  } catch (err) {
    console.error(err);
  }
};
