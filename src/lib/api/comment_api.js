import { toast } from "@/hooks/use-toast";
import { ENDPOINTS } from "../constants";
import { MESSAGES } from "../messages";

export async function upvoteComment(apiCall, id) {
    const url = `${ENDPOINTS.UPVOTE_COMMENT}${id}`
    const response = await apiCall(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (!response.ok) {
      if (response.status == 400) {
        try {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message,
            variant: "destructive" // destructive
          })
        } catch (error) {
          console.error("Error parsing error response:", error);
        }
      }
      else if (response.status == 500) {
        toast({
          title: "Error",
          description: MESSAGES.MSG01,
          variant: "destructive" // destructive
        })
      }
      throw new Error("Failed to upvote");
    }
    else {
      const text = await response.text()
      if (!text) return null
      return JSON.parse(text)
    }
  }
  
  export async function unupvoteComment(apiCall, id) {
    const url = `${ENDPOINTS.UNUPVOTE_COMMENT}${id}`
    const response = await apiCall(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (!response.ok) {
      if (response.status == 400) {
        try {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message,
            variant: "destructive" // destructive
          })
        } catch (error) {
          console.error("Error parsing error response:", error);
        }
      }
      else if (response.status == 500) {
        toast({
          title: "Error",
          description: MESSAGES.MSG01,
          variant: "destructive" // destructive
        })
      }
      throw new Error("Failed to unupvote");
    }
    else {
      const text = await response.text()
      if (!text) return null
      return JSON.parse(text)
    }
  }