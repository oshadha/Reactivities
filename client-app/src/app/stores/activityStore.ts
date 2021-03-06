import {observable, action, computed, configure, runInAction} from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({enforceActions: 'always'})

class ActivityStore {
    @observable activityRegistry = new Map();
    @observable activity: IActivity | null = null; 
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';

    @computed get actvitiesByDate () {
        return Array.from(this.activityRegistry.values()).sort((a,b) => Date.parse(a.date) - Date.parse(b.date));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        try{
            const activities = await agent.Activities.list();
            runInAction('loading activities',() => {
                activities.forEach(activity => {
                activity.date = activity.date.split('.')[0]
                this.activityRegistry.set(activity.id, activity);
            });
            this.loadingInitial = false;
            })
        } catch (error) {
            console.log(error);
            runInAction('loading activities error',() => {
            this.loadingInitial = false;
            });
        }
    }

    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if(activity) {
            this.activity = activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction('getting activity', () => {
                    this.activity = activity;
                    this.loadingInitial = false;
                });
            } catch(error) {
                runInAction('getting activity error', () => {
                    this.loadingInitial = false;
                });
                console.log(error);
            }
        }
    }

    @action clearActivity = () => {
        this.activity = null;
    }

    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try{
            await agent.Activities.create(activity);
            runInAction('creating activity',() => {
            this.activityRegistry.set(activity.id, activity);
            this.submitting = false;
            });
        } catch (error) {
            console.log(error);
            runInAction('creating activity error',() => {
            this.submitting = false;});
        }
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try{
            await agent.Activities.update(activity);
            runInAction('editing activity',() => {
            this.activityRegistry.set(activity.id, activity);
            this.activity = activity;
            this.submitting = false;
        });
        } catch (error) {
            console.log(error);
            runInAction('editing activity error',() => {
            this.submitting = false;
        });
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction('deleting activity',() => {
            this.activityRegistry.delete(id);
            this.submitting = false;
            this.target = '';});
        } catch (error) {
            console.log(error);
            runInAction('deleting activity error',() => {
            this.submitting = false;
            this.target = '';});
        }
    }
}

export default createContext(new ActivityStore())