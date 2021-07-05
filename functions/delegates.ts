import "source-map-support";

import { DynamoDB } from "aws-sdk";

const dynamo = new DynamoDB.DocumentClient();

export const handler = async () => {
  try {
    const data = await dynamo
      .get({
        TableName: "inverse",
        Key: {
          field: "delegates",
        },
      })
      .promise();

    if (!data.Item) {
      return {
        statusCode: 404,
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        blockNumber: data.Item.blockNumber,
        timestamp: data.Item.timestamp,
        delegates: data.Item.data,
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
