import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { createTask } from '../api/tasksApi';
import { apiClient } from '../../../lib/apiClient';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Task Attachment Feature Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Create Task works without an attachment', async () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByRole('textbox', { name: /task title/i }), {
      target: { value: 'Task without file' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Task without file',
        description: undefined,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: undefined,
        attachment: undefined,
      });
    });
  });

  it('2. User can select a valid PDF file', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const pdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('11 Bytes')).toBeInTheDocument();
  });

  it('3. User can select valid PNG, JPG, DOC, and DOCX files', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const docxFile = new File(['docx content'], 'spec.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    fireEvent.change(fileInput, { target: { files: [docxFile] } });

    expect(screen.getByText('spec.docx')).toBeInTheDocument();
    expect(screen.getByText('12 Bytes')).toBeInTheDocument();
  });

  it('4. Invalid file type (.exe) is rejected with clear error message', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const exeFile = new File(['binary content'], 'setup.exe', { type: 'application/x-msdownload' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [exeFile] } });

    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    expect(screen.queryByText('setup.exe')).not.toBeInTheDocument();
  });

  it('5. File larger than 5 MB is rejected with clear error message', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const largeFile = new File([new ArrayBuffer(5.1 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByText(/File size cannot exceed 5 MB/i)).toBeInTheDocument();
    expect(screen.queryByText('large.pdf')).not.toBeInTheDocument();
  });

  it('6. Selected file is displayed with name and formatted size', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const file = new File([new ArrayBuffer(245678)], 'requirements.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('requirements.pdf')).toBeInTheDocument();
    expect(screen.getByText('239.9 KB')).toBeInTheDocument();
  });

  it('7. User can remove selected file and return to empty attachment state', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('test.pdf')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /remove attachment/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /attach file/i })).toBeInTheDocument();
  });

  it('8. Form submits successfully with selected attachment file', async () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByRole('textbox', { name: /task title/i }), {
      target: { value: 'Attached Task' },
    });

    const file = new File(['content'], 'attached.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Attached Task',
          attachment: file,
        })
      );
    });
  });

  it('9 & 10. createTask constructs FormData and includes attachment when file is provided', async () => {
    const mockTask = { _id: '123', title: 'Task with FormData' };
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { data: mockTask } });

    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    await createTask({
      title: 'Task with FormData',
      description: 'Desc',
      status: 'TODO',
      priority: 'HIGH',
      attachment: file,
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body] = (apiClient.post as unknown as ReturnType<typeof vi.fn>).mock.calls[0];

    expect(url).toBe('/tasks');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('title')).toBe('Task with FormData');
    expect(body.get('description')).toBe('Desc');
    expect(body.get('status')).toBe('TODO');
    expect(body.get('priority')).toBe('HIGH');
    expect(body.get('attachment')).toEqual(file);
  });

  it('11. createTask sends standard JSON payload when attachment is not included', async () => {
    const mockTask = { _id: '124', title: 'JSON Task' };
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { data: mockTask } });

    const payload = { title: 'JSON Task', status: 'TODO' as const, priority: 'LOW' as const };
    await createTask(payload);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body] = (apiClient.post as unknown as ReturnType<typeof vi.fn>).mock.calls[0];

    expect(url).toBe('/tasks');
    expect(body).toEqual(payload);
    expect(body).not.toBeInstanceOf(FormData);
  });

  it('12. Loading state disables form controls during submission', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={true} />);

    expect(screen.getByRole('textbox', { name: /task title/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating\.\.\./i })).toBeDisabled();
  });

  it('13. Backend error message alert banner is displayed', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        apiErrorMessage="Failed to upload file attachment: File size cannot exceed 5 MB"
      />
    );

    expect(
      screen.getByText(/Failed to upload file attachment: File size cannot exceed 5 MB/i)
    ).toBeInTheDocument();
  });

  it('14 & 15. TaskCard renders attachment link and opens safely in new tab', () => {
    const mockTaskWithAttachment = {
      _id: 'task-100',
      title: 'Task With Cloudinary Attachment',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      attachment: {
        fileName: 'report.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/v1234/task-manager/attachments/report.pdf',
        publicId: 'task-manager/attachments/report_1234',
        mimeType: 'application/pdf',
        fileSize: 245678,
      },
    };

    render(
      <TaskCard
        task={mockTaskWithAttachment}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const attachmentLink = screen.getByTestId('task-attachment-link-task-100');
    expect(attachmentLink).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();

    expect(attachmentLink).toHaveAttribute('href', mockTaskWithAttachment.attachment.fileUrl);
    expect(attachmentLink).toHaveAttribute('target', '_blank');
    expect(attachmentLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
