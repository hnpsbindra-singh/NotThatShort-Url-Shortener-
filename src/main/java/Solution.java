import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public List<List<Integer>> allPathsSourceTarget(int[][] graph) {
        List<List<Integer>> list = new ArrayList<>();
        ArrayList<Integer> res  = new ArrayList<>();
        res.add(0);
        bfs(graph, list, 0, res);
        return list;
    }

    private void bfs(int[][] graph, List<List<Integer>> res, int i, ArrayList<Integer> list) {
        if (i==graph.length-1){
            res.add(new ArrayList<>(list));
            return;
        }
        for (int j = 0; j < graph[i].length; j++) {
            list.add(graph[i][j]);
            bfs(graph, res, j, list);
            list.remove(list.size()-1);
        }
    }
}