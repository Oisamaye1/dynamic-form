import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  questionGroup: {
    marginBottom: 15,
  },
  question: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#4b5563",
  },
  answer: {
    fontSize: 14,
    marginBottom: 10,
  },
  metadata: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
})

// Define the PDF document component
export const FormResponsePDF = ({
  response,
  sections,
}: {
  response: any
  sections: Record<string, { question: string; answer: string }[]>
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Form Submission Details</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.metadata}>Submission Date: {new Date(response.created_at).toLocaleString()}</Text>
        {response.is_anonymous && <Text style={styles.metadata}>Anonymous Submission</Text>}
      </View>

      {Object.entries(sections).map(([sectionName, items]) => (
        <View key={sectionName} style={styles.section}>
          <Text style={styles.sectionTitle}>{sectionName.replace("_", " ")}</Text>

          {items.map((item, index) => (
            <View key={index} style={styles.questionGroup}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
)
