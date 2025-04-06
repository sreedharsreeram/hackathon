'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    createProject,
    performWebSearch,
    generateFollowups,
    storeNodeWithEmbeddings
} from '@/server/actions';
import { checkAuth } from '@/server/actions/auth';

export function useProgressiveSearch() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const router = useRouter();

    const startResearchProcess = async (query: string) => {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (isLoading) return;

        setIsLoading(true);
        setStatus("Initiating research...");

        setTimeout(() => {
            let toastId: string | number | undefined = undefined;
            const runAsyncSteps = async () => {
                try {
                    toastId = toast.loading('Checking authentication...');
                    

                    toast.loading('Initiating research...', { id: toastId });

                    setStatus("Creating new project...");
                    toast.loading('Creating new project...', { id: toastId });
                    const projectResult = await createProject(query);
                    if (!projectResult?.id) throw new Error('Failed to create project.');
                    const projectId = projectResult.id;
                    const projectName = projectResult.name || `Project #${projectId}`;
                    console.log('Project created:', projectId, projectName);
                    toast.loading(`${projectName} created. Starting web search...`, { id: toastId });

                    const searchData = await performWebSearch(query);
                    if (!searchData) throw new Error('Web search failed.');

                    setStatus("Web search complete. Generating follow-up questions...");
                    toast.loading('Web search complete. Generating follow-ups...', { id: toastId });

                    const followupData = await generateFollowups(searchData.answer);
                    if (!followupData) throw new Error('Follow-up generation failed.');

                    setStatus("Follow-ups generated. Storing data...");
                    toast.loading('Follow-ups generated. Storing results & embeddings...', { id: toastId });

                    const newNode = await storeNodeWithEmbeddings({
                        projectId,
                        nodeData: searchData,
                        followupData,
                    });
                    if (!newNode?.id) throw new Error('Failed to store node and generate embeddings.');

                    setStatus("Research complete! Redirecting...");
                    toast.success(`Research complete! Navigating to project #${projectId}...`, {
                        id: toastId,
                        duration: 3000,
                    });

                    router.push(`/${projectId}`);
                } catch (error: any) {
                    console.error('Research process error:', error);
                    toast.error(error?.message || 'Research process failed. Please try again.', {
                        id: toastId,
                        duration: 5000,
                    });
                    setStatus("Something went wrong. Please try again.");
                } finally {
                    setTimeout(() => {
                        setIsLoading(false);
                        setStatus(null);
                    }, 500);
                }
            };
            runAsyncSteps();
        }, 0);
    };

    return { isLoading, status, startResearchProcess };
}
