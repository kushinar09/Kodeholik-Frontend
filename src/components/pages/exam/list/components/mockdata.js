// This is just for testing - you would replace this with your actual API call
export const mockExamResults = {
  grade: 4.5,
  problemResults: [
    {
      id: 98,
      link: "edit-distance-1",
      title: "Edit Distance 1",
      code: "public static int solve(int i, int j, String s1, String s2, int[][] dp) { \n if (i == -1) return j + 1; \n if (j == -1) return i + 1; \n if (dp[i][j] != -1) return dp[i][j]; \n if (s1.charAt(i) == s2.charAt(j)) { \n return dp[i][j] = solve(i - 1, j - 1, s1, s2, dp); \n } else { \n int insert = 1 + solve(i, j - 1, s1, s2, dp); \n int replace = 1 + solve(i - 1, j - 1, s1, s2, dp); \n int delete = 1 + solve(i - 1, j, s1, s2, dp); \n return dp[i][j] = Math.min(insert, Math.min(replace, delete)); \n } \n } \n public static int minDistance(String word1, String word2) { \n int m = word1.length(), n = word2.length(); \n int[][] dp = new int[m + 1][n + 1]; \n for (int[] row : dp) Arrays.fill(row, -1); \n 0; \n }",
      languageName: "Java",
      noTestCasePassed: 0,
      percentPassed: "0%",
      point: 0.0
    },
    {
      id: 100,
      link: "palindrome-number",
      title: "Palindrome Number",
      code: "public static boolean isPalindrome(int x) { \n if (x < 0) { \n return false; \n } \n int reverse = 0; \n int xcopy = x; \n while (x > 0) { \n reverse = (reverse * 10) + (x % 10); \n x /= 10; \n } \n return true; \n }",
      languageName: "Java",
      noTestCasePassed: 6,
      percentPassed: "66.67%",
      point: 1.5
    },
    {
      id: 112,
      link: "gas-station",
      title: "Gas Station",
      code: "public static int canCompleteCircuit(int[] gas, int[] cost) { \n int len = gas.length; \n int[] diff = new int[len]; \n int to = 0; \n for(int i = 0;i < len;i++){ \n diff[i] += (gas[i]-cost[i]); \n to += diff[i]; \n } \n if(to < 0){ \n return -1; \n } \n int index = 0; \n to = 0; \n for(int i = 0;i < len;i++){ \n to += diff[i]; \n if(to < 0){ \n index = i+1; \n to = 0; \n } \n } \n return index; \n }",
      languageName: "Java",
      noTestCasePassed: 2,
      percentPassed: "100%",
      point: 3.0
    }
  ]
}

// For testing, you can use this function to simulate an API call
export const mockFetchExamResults = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve(mockExamResults)
      })
    }, 500) // Simulate network delay
  })
}

