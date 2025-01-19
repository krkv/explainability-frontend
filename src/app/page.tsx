import homeStyles from '@/styles/home.module.css'
import AccessForm from '@/components/AccessForm'

export default function HomePage() {
    return (
        <div className={homeStyles.container}>
            <AccessForm />
        </div>
    )
}