import { getTokensData } from "../utils/ccai";
import { sleep } from "../utils/utils";
import { devLog, logDebug, logInfo, logWarn, logError } from '../utils/logger';

export class TokensDataSingleton {
  public static isDataLoading = false
  private static tokensDataMap = new Map();

  public static async getData() {
    if (this.isDataLoading) {
      // add trials
      await sleep(1000)
      return this.getData()
    }

    if (this.tokensDataMap.size === 0) {
        return await this.requestData()
    }

    return this.tokensDataMap;
  }

  private static async requestData() {
      this.isDataLoading = true
      await getTokensData().then((data) => {
        devLog('set to false', data)
        this.isDataLoading = false
        this.tokensDataMap = data
      });
      return this.tokensDataMap;
  }
}