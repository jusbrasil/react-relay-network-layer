import { queryPost } from './_query';

export default function queriesBatch(relayRequestList, fetchWithMiddleware) {
  const requestMap = {};
  relayRequestList.forEach((req) => {
    const reqId = req.getID();
    if (reqId in requestMap) {
      requestMap[reqId].push(req);
    } else {
      requestMap[reqId] = [req];
    }
  });

  const req = {
    relayReqId: `BATCH_QUERY:${Object.keys(requestMap).join(':')}`,
    relayReqObj: relayRequestList,
    relayReqType: 'batch-query',
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
  };

  req.body = JSON.stringify(
    Object.keys(requestMap).map((id) => ({
      id,
      query: requestMap[id][0].getQueryString(),
      variables: requestMap[id][0].getVariables(),
    }))
  );

  return fetchWithMiddleware(req)
    .then(payloadList => {
      payloadList.forEach(({ id, payload }) => {
        const relayRequests = requestMap[id];
        if (relayRequests) {
          relayRequests.forEach((relayRequest) => {
            queryPost(
              relayRequest,
              new Promise(resolve => { resolve(payload); })
            );
          });
        }
      });
    }).catch(e => {
      return Promise.all(relayRequestList.map(relayRequest => {
        return relayRequest.reject(e);
      }));
    });
}
