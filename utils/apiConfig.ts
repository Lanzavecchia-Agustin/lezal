export const API_ROUTES = {
  joinRoom: (roomId: string, userName: string, attrString: string) =>
    `/api/joinRoom?roomId=${roomId}&userName=${userName}&attributes=${attrString}`,
    
  vote: (roomId: string, userName: string, optionId: number) =>
    `/api/vote?roomId=${roomId}&userName=${userName}&optionId=${optionId}`,

  closeVoting: (roomId: string) =>
    `/api/closeVoting?roomId=${roomId}`,
};
