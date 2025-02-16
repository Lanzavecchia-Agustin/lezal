export const API_ROUTES = {
  joinRoom: (roomId: string, userName: string, attrString: string, avatar: string) =>
    `/api/joinRoom?roomId=${roomId}&userName=${userName}&attributes=${attrString}&avatar=${avatar}`,
    
  vote: (roomId: string, userName: string, optionId: number) =>
    `/api/vote?roomId=${roomId}&userName=${userName}&optionId=${optionId}`,

  closeVoting: (roomId: string) =>
    `/api/closeVoting?roomId=${roomId}`,
};
