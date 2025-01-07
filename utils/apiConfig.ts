export const API_ROUTES = {
    joinRoom: (roomId: string, userName: string) => 
      `/api/joinRoom?roomId=${roomId}&userName=${userName}`,
    vote: (roomId: string, userName: string, optionId: number) =>
      `/api/vote?roomId=${roomId}&userName=${userName}&optionId=${optionId}`,
    closeVoting: (roomId: string) =>
      `/api/close-voting?roomId=${roomId}`,
  };