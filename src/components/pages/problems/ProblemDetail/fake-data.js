export const mockEditorial = {
  "editorialDtos": [
    {
      "editorialTitle": "Kodeholik - Editorial",
      "editorialTextSolution": "The problem requires transforming one string into another using three operations: insert, delete, or replace. This is a classic Dynamic Programming problem, where we aim to minimize the cost of edits. The solution involves comparing prefixes of both strings to compute the minimum operations required.",
      "editorialSkills": [
        "Math",
        "Array"
      ],
      "solutionCodes": [
        {
          "solutionLanguage": "Java",
          "solutionCode": "public static int solve(int i, int j, String s1, String s2, int dp[][]) {\n" +
            "\tif (i == 0 && j == 0) {\n" +
            "\t\tif (s1.charAt(i) == s2.charAt(j)) return 0;\n" +
            "\t\telse return 1;\n" +
            "\t}\n" +
            "\tif (j == -1) return i + 1;\n" +
            "\tif (i == -1) return j + 1;\n" +
            "\tif (dp[i][j] != -1) return dp[i][j];\n" +
            "\n" +
            "\tint insert = 300000000;\n" +
            "\tint replace = 30000000;\n" +
            "\tint delete = 30000000;\n" +
            "\n" +
            "\tif (s1.charAt(i) == s2.charAt(j)) {\n" +
            "\t\treturn dp[i][j] = solve(i - 1, j - 1, s1, s2, dp);\n" +
            "\t} else {\n" +
            "\t\tinsert = 1 + solve(i, j - 1, s1, s2, dp);\n" +
            "\t\treplace = 1 + solve(i - 1, j - 1, s1, s2, dp);\n" +
            "\t\tdelete = 1 + solve(i - 1, j, s1, s2, dp);\n" +
            "\t}\n" +
            "\treturn dp[i][j] = Math.min(insert, Math.min(replace, delete));\n" +
            "}\n" +
            "\n" +
            "public static int minDistance(String word1, String word2) {\n" +
            "\tint dp[][] = new int[word1.length()][word2.length()];\n" +
            "\tfor (int[] I : dp) Arrays.fill(I, -1);\n" +
            "\treturn solve(word1.length() - 1, word2.length() - 1, word1, word2, dp);\n" +
            "}"

        },
        {
          "solutionLanguage": "C",
          "solutionCode": "public int solve(int i, int j, String s1, String s2, int dp[][]) {\n" +
            "\tif (i == 0 && j == 0) {\n" +
            "\t\tif (s1.charAt(i) == s2.charAt(j)) return 0;\n" +
            "\t\telse return 1;\n" +
            "\t}\n" +
            "\tif (j == -1) return i + 1;\n" +
            "\tif (i == -1) return j + 1;\n" +
            "\tif (dp[i][j] != -1) return dp[i][j];\n" +
            "\n" +
            "\tint insert = 300000000;\n" +
            "\tint replace = 30000000;\n" +
            "\tint delete = 30000000;\n" +
            "\n" +
            "\tif (s1.charAt(i) == s2.charAt(j)) {\n" +
            "\t\treturn dp[i][j] = solve(i - 1, j - 1, s1, s2, dp);\n" +
            "\t} else {\n" +
            "\t\tinsert = 1 + solve(i, j - 1, s1, s2, dp);\n" +
            "\t\treplace = 1 + solve(i - 1, j - 1, s1, s2, dp);\n" +
            "\t\tdelete = 1 + solve(i - 1, j, s1, s2, dp);\n" +
            "\t}\n" +
            "\treturn dp[i][j] = Math.min(insert, Math.min(replace, delete));\n" +
            "}\n" +
            "\n" +
            "public static int minDistance(String word1, String word2) {\n" +
            "\tint dp[][] = new int[word1.length()][word2.length()];\n" +
            "\tfor (int[] I : dp) Arrays.fill(I, -1);\n" +
            "\treturn solve(word1.length() - 1, word2.length() - 1, word1, word2, dp);\n" +
            "}"

        }
      ]
    }
  ]
}

export const mockSolutions =
{
  "content": [
    {
      "id": 108,
      "title": "One line code in Java",
      "noUpvote": 0,
      "noComment": 0,
      "createdAt": "18/01/2025, 16:25",
      "createdBy": {
        "avatar": null,
        "username": "Jasmine Milk"
      }
    },
    {
      "id": 109,
      "title": "Simple Math Multiplication Java",
      "noUpvote": 0,
      "noComment": 0,
      "createdAt": "18/01/2025, 16:25",
      "createdBy": {
        "avatar": null,
        "username": "HngThng"
      }
    },
    {
      "id": 110,
      "title": "[Java] Simple solution",
      "noUpvote": 0,
      "noComment": 0,
      "createdAt": "18/01/2025, 16:25",
      "createdBy": {
        "avatar": null,
        "username": "Thai"
      }
    },
    {
      "id": 111,
      "title": "Easiest solution",
      "noUpvote": 0,
      "noComment": 0,
      "createdAt": "18/01/2025, 16:25",
      "createdBy": {
        "avatar": null,
        "username": "Thai"
      }
    },
    {
      "id": 112,
      "title": "Java O(n * m)",
      "noUpvote": 0,
      "noComment": 0,
      "createdAt": "18/01/2025, 16:25",
      "createdBy": {
        "avatar": null,
        "username": "Duy"
      }
    }
  ],
  "pageable": {
    "pageNumber": 2,
    "pageSize": 5,
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 10,
    "paged": true,
    "unpaged": false
  },
  "last": false,
  "totalPages": 4,
  "totalElements": 20,
  "size": 5,
  "number": 2,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 5,
  "first": false,
  "empty": false
}

const SubmissionStatus = {
  ACCEPTED: "ACCEPTED",
  WRONG_ANSWER: "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED: "MEMORY_LIMIT_EXCEEDED",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  COMPILATION_ERROR: "COMPILATION_ERROR",
  PENDING: "PENDING"
}

export const mockSubmissions = [
  {
    id: 1001,
    status: SubmissionStatus.ACCEPTED,
    problemTitle: "Two Sum",
    problemLink: "https://example.com/problems/two-sum",
    languageName: "JavaScript",
    executionTime: 56.2,
    memoryUsage: 38.4,
    createdAt: Date.now() - 1000 * 60 * 30 // 30 minutes ago
  },
  {
    id: 1002,
    status: SubmissionStatus.WRONG_ANSWER,
    problemTitle: "Valid Parentheses",
    problemLink: "https://example.com/problems/valid-parentheses",
    languageName: "Python",
    executionTime: 32.7,
    memoryUsage: 14.2,
    createdAt: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
  },
  {
    id: 1003,
    status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
    problemTitle: "Merge K Sorted Lists",
    problemLink: "https://example.com/problems/merge-k-sorted-lists",
    languageName: "Java",
    executionTime: 500.0,
    memoryUsage: 45.8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
  },
  {
    id: 1004,
    status: SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
    problemTitle: "LRU Cache",
    problemLink: "https://example.com/problems/lru-cache",
    languageName: "C++",
    executionTime: 78.3,
    memoryUsage: 256.0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
  },
  {
    id: 1005,
    status: SubmissionStatus.RUNTIME_ERROR,
    problemTitle: "Trapping Rain Water",
    problemLink: "https://example.com/problems/trapping-rain-water",
    languageName: "Go",
    executionTime: 45.1,
    memoryUsage: 22.7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
  },
  {
    id: 1006,
    status: SubmissionStatus.COMPILATION_ERROR,
    problemTitle: "Word Break",
    problemLink: "https://example.com/problems/word-break",
    languageName: "Rust",
    executionTime: 0.0,
    memoryUsage: 0.0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4 // 4 days ago
  },
  {
    id: 1007,
    status: SubmissionStatus.PENDING,
    problemTitle: "Median of Two Sorted Arrays",
    problemLink: "https://example.com/problems/median-of-two-sorted-arrays",
    languageName: "TypeScript",
    executionTime: 0.0,
    memoryUsage: 0.0,
    createdAt: Date.now() - 1000 * 60 * 5 // 5 minutes ago
  }
]