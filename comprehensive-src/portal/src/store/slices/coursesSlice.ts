import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortalCourse, Enrollment, CourseFilters } from '@scroll-university/shared-types';

interface CoursesState {
  courses: PortalCourse[];
  enrollments: Enrollment[];
  filters: CourseFilters;
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  enrollments: [],
  filters: {},
  loading: false,
  error: null,
};

export const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<PortalCourse[]>) => {
      state.courses = action.payload;
    },
    setEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
      state.enrollments = action.payload;
    },
    addEnrollment: (state, action: PayloadAction<Enrollment>) => {
      state.enrollments.push(action.payload);
    },
    updateEnrollment: (state, action: PayloadAction<Enrollment>) => {
      const index = state.enrollments.findIndex(e => e.enrollment_id === action.payload.enrollment_id);
      if (index !== -1) {
        state.enrollments[index] = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<CourseFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<CourseFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCourses,
  setEnrollments,
  addEnrollment,
  updateEnrollment,
  setFilters,
  updateFilters,
  setLoading,
  setError,
} = coursesSlice.actions;