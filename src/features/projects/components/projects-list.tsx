import { useProjectsPartial } from '../hooks/use-projects'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {Doc} from '../../../../convex/_generated/dataModel'
import Link from 'next/link'
import { GlobeIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'


interface ProjectsListProps {
    onViewAll: () => void
}
const formatTimestamp = (timestampt : number) => {
    return formatDistanceToNow(new Date(timestampt) , {addSuffix :  true})
}

const ProjectItem = ({data } : {data : Doc<"projects">}) => {
    return (
        <Link href={`/projects/${data._id}`} className="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center justify-between w-full group">
            <div className="flex items-center gap-2">
                <GlobeIcon />
            </div>
            <span > 
                {formatTimestamp(data.updatedAt)}
            </span>
        </Link>
    )
}

const ProjectsList = ({onViewAll} :ProjectsListProps) => {
    const projects = useProjectsPartial(6)
    if(projects === undefined){
        return <Spinner className="size-4 text-ring" />
    }
    // const [mostRecent , ...rest] = projects
    
  return (
    <div className='flex flex-col gap-4'>
        {projects.length > 0 && (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                        Recent projects
                    </span>
                    <Button variant="outline" className="flex items-center  gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors">
                        <span> View all </span>
                        <Kbd className="bg-accent border"> ctrl + K </Kbd>
                    </Button>
                </div>
                <ul className="flex flex-col">
                    {projects.map(project => (
                        <ProjectItem key={project._id} data={project} />
                    ))}
                </ul>
            </div>
        )}
    </div>
  )
}

export default ProjectsList