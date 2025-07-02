import React, { useState, useEffect, useRef } from 'react';
import { useCreateItem } from '../hooks/items/useCreateItem';
import { useUpdateItem } from '../hooks/items/useUpdateItem';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Zod schema for item validation
const itemSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  category: z.string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters')
    .trim(),
  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number'
  })
    .positive('Price must be greater than 0')
    .max(999999, 'Price must be less than 999,999')
    .multipleOf(0.01, 'Price must have at most 2 decimal places')
});

export function CreateItemModal({ isOpen, onClose, item = null }) {
  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: ''
  });
  const [errors, setErrors] = useState({});

  // Refs for focus management
  const modalRef = useRef(null);
  const firstFocusableElementRef = useRef(null);
  const nameInputRef = useRef(null);

  // Determine if we're editing or creating
  const isEditing = !!item;

  // Initialize form data when item changes (for editing)
  useEffect(() => {
    if (isEditing && item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        price: item.price?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        price: ''
      });
    }
  }, [item, isEditing]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    modalRef.current.addEventListener('keydown', handleTabKey);
    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener('keydown', handleTabKey);
      }
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Check if we have item ID for editing
    if (isEditing && !item?.id) {
      toast.error('Item ID is missing');
      return;
    }

    try {
      // Prepare data for validation
      const dataToValidate = {
        name: formData.name,
        category: formData.category,
        price: formData.price === '' ? undefined : parseFloat(formData.price)
      };

      // Validate with Zod schema
      const validatedData = itemSchema.parse(dataToValidate);

      if (isEditing) {
        // Update the item
        updateItemMutation.mutate({ 
          id: item.id, 
          data: validatedData 
        }, {
          onSuccess: (data) => {
            toast.success(`Item "${data.name}" updated successfully!`);
            onClose();
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to update item');
          }
        });
      } else {
        // Create the item
        createItemMutation.mutate(validatedData, {
          onSuccess: (data) => {
            toast.success(`Item "${data.name}" created successfully!`);
            // Clear form and close modal
            setFormData({ name: '', category: '', price: '' });
            onClose();
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to create item');
          }
        });
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors
        const fieldErrors = {};
        err.errors.forEach((error) => {
          const fieldName = error.path[0];
          fieldErrors[fieldName] = error.message;
        });
        setErrors(fieldErrors);
        toast.error('Please fix the form errors before submitting');
      }
    }
  };

  const handleClose = () => {
    const isLoading = createItemMutation.isPending || updateItemMutation.isPending;
    if (!isLoading) {
      if (!isEditing) {
        setFormData({ name: '', category: '', price: '' });
      }
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <header className="modal-header">
          <h2 id="modal-title">{isEditing ? 'Edit Item' : 'Create New Item'}</h2>
          <button 
            ref={firstFocusableElementRef}
            className="modal-close-button"
            onClick={handleClose}
            disabled={createItemMutation.isPending || updateItemMutation.isPending}
            aria-label="Close dialog"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div id="modal-description" className="sr-only">
          {isEditing ? 'Edit the item details in the form below' : 'Fill out the form below to create a new item'}
        </div>

        <form onSubmit={handleSubmit} className="create-item-form" noValidate>
          <fieldset disabled={createItemMutation.isPending || updateItemMutation.isPending}>
            <legend className="sr-only">{isEditing ? 'Edit Item Form' : 'Create New Item Form'}</legend>

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                ref={nameInputRef}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter item name"
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
                className={errors.name ? 'input-error' : ''}
                required
                aria-required="true"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <div id="name-error" className="field-error" role="alert">
                  {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter category"
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
                className={errors.category ? 'input-error' : ''}
                required
                aria-required="true"
                aria-invalid={errors.category ? 'true' : 'false'}
                aria-describedby={errors.category ? 'category-error' : undefined}
              />
              {errors.category && (
                <div id="category-error" className="field-error" role="alert">
                  {errors.category}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
                className={errors.price ? 'input-error' : ''}
                required
                min="0"
                step="0.01"
                aria-required="true"
                aria-invalid={errors.price ? 'true' : 'false'}
                aria-describedby={errors.price ? 'price-error' : 'price-help'}
              />
              <div id="price-help" className="sr-only">
                Enter a positive number with up to 2 decimal places
              </div>
              {errors.price && (
                <div id="price-error" className="field-error" role="alert">
                  {errors.price}
                </div>
              )}
            </div>
          </fieldset>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="secondary-button"
              disabled={createItemMutation.isPending || updateItemMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={createItemMutation.isPending || updateItemMutation.isPending}
            >
              {createItemMutation.isPending || updateItemMutation.isPending
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 