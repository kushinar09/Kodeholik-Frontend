"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Upload, FileText, Info } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  testCases: z.array(
    z.object({
      language: z.string(),
      file: z.instanceof(File, { message: "Test case file is required" }),
    }),
  ),
})

export function TestCases({ formData, updateFormData, onPrevious, onSubmit }) {
  const [activeLanguage, setActiveLanguage] = useState(formData.details.languageSupport[0] || "")
  const [files, setFiles] = useState({})

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testCases: formData.details.languageSupport.map((lang) => ({
        language: lang,
        file: null,
      })),
    },
  })

  const handleFileChange = (language, index, event) => {
    const file = event.target.files[0]
    if (file) {
      setFiles((prev) => ({ ...prev, [language]: file }))
      form.setValue(`testCases.${index}.file`, file)
    }
  }

  const handleSubmit = (values) => {
    // Get the first file from the test cases
    const excelFile = values.testCases.find((tc) => tc.file)?.file || null

    const transformedData = {
      excelFile,
    }

    console.log("Test Cases submitting:", transformedData)
    updateFormData(transformedData, "testcases")
    onSubmit()
  }

  const getFileFormatGuide = (language) => {
    switch (language) {
      case "Java":
        return [
          "Each test case should be on a new line",
          "Input and expected output should be separated by a comma",
          "For array inputs, use square brackets: [1,2,3]",
          "Example: [1,2,3],9 -> [0,1]",
        ]
      case "C":
        return [
          "Each test case should be on a new line",
          "Input and expected output should be separated by a comma",
          "For array inputs, use curly braces: {1,2,3}",
          "Example: {1,2,3},9 -> {0,1}",
        ]
      default:
        return [
          "Each test case should be on a new line",
          "Input and expected output should be separated by a comma",
          "Follow standard format for the selected language",
        ]
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Test Cases</h2>

        <Alert className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please upload test case files for each language. Make sure to follow the format guide for each language.
          </AlertDescription>
        </Alert>

        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <TabsList className="w-full">
            {formData.details.languageSupport.map((language) => (
              <TabsTrigger key={language} value={language} className="flex-1">
                {language}
              </TabsTrigger>
            ))}
          </TabsList>

          {formData.details.languageSupport.map((language, index) => (
            <TabsContent key={language} value={language}>
              <Card>
                <CardHeader>
                  <CardTitle>{language} Test Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`testCases.${index}.file`}
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-md p-6">
                            <div className="text-center">
                              {files[language] ? (
                                <div className="flex flex-col items-center">
                                  <FileText className="h-8 w-8 text-primary mb-2" />
                                  <p className="text-sm font-medium">{files[language].name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(files[language].size / 1024).toFixed(2)} KB
                                  </p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => document.getElementById(`file-${language}`).click()}
                                  >
                                    Change File
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground mb-1">
                                    Drag and drop or click to upload test cases
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById(`file-${language}`).click()}
                                  >
                                    Select File
                                  </Button>
                                </div>
                              )}
                              <input
                                id={`file-${language}`}
                                type="file"
                                className="hidden"
                                accept=".txt,.csv,.xlsx,.xls"
                                onChange={(e) => {
                                  handleFileChange(language, index, e)
                                  onChange(e.target.files[0])
                                }}
                                {...field}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">File Format Guide:</h3>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                      {getFileFormatGuide(language).map((guide, i) => (
                        <li key={i}>{guide}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Submit Problem
          </Button>
        </div>
      </form>
    </Form>
  )
}

