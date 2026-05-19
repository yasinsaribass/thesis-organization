export default async function CreateTaskForStudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <div>Create Task for Student Placeholder for {id}</div>;
}
