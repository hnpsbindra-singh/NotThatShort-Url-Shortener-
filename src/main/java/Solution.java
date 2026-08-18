import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int i = 0; i < isConnected.length; i++) {
            for (int j = 0; j < isConnected[0].length; j++) {
                if (isConnected[i][j]==1){
                    adj.get(i).add(j);
                    adj.get(j).add(i);
                }
            }
        }
        int[] vis = new int[isConnected.length];
        int count = 0;
        for (int i = 0; i < adj.size(); i++) {
            if (vis[i]==0){
                count++;
                bfs(adj, i, vis);
            }
        }
        return count;
    }

    private void bfs(List<List<Integer>> adj, int i, int[] vis) {
        Queue<Integer> q = new LinkedList<>();
        q.add(i);
        vis[i] = 1;
        while (!q.isEmpty()){
            int top = q.poll();
            for (int j: adj.get(i)) {
                if (vis[j]!=0){
                    q.add(j);
                    vis[j] = 1;
                }
            }
        }

    }
}